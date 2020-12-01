const fs = require('fs');
const { exec, execFile, spawn, onExit } = require('child_process');
const path = require("path");
const rmdir_rf = require('rimraf');
const util = require('util');
// custom function for "promisifying" fs.access, to avoid callback pyramid of doom
fs.access[util.promisify.custom] = (path, mode) => {
   return new Promise((resolve,reject) => {
      fs.access(path, mode, (err) => {
         if(err) reject(err);
         else resolve(); 
      });
   });
}
const access = util.promisify(fs.access); 

/**
 * Constructor for all compilers using Docker. 
 * @param {Object} db Database connection.
 * @param {String} workspace_path Path to directory containing files to compile and run. 
 * @param {Number} assignment_id This code's assignment's ID number (integer). 
 * @param {Number} student_id ID number of the user to whom this code belongs.
 * @param {String} docker_image_path Path to docker file to be used to compile and run the code
 * @param {String} compile_cmd Command for compiling this code. 
 * @param {String} stdin Input stream to be entered into code. 
 * @param {Number} [timeout=15000] 
 */
class Compiler {
   constructor(db, workspace_path, assignment_id, student_id, dockerfile_path, stdin, timeout = 15000) {
      this.db = db;
      this.workspace_path = workspace_path;
      this.assignment_id = assignment_id;
      this.student_id = student_id;
      this.dockerfile_path = dockerfile_path;
      this.assignment_workspace = this.workspace_path + "/" + assignment_id;
      this.student_workspace = this.assignment_workspace + "/" + student_id;
      this.before_run_workspace = this.student_workspace + "/before_run"; 
      this.after_run_workspace = this.student_workspace + "/after_run"; 
      this.stdin = stdin;
      this.timeout = timeout;
      this.image_name = "cpp_" + this.assignment_id + "_" + this.student_id;
      this.container_name = this.image_name + "_" + Date.now(); 
      this.docker_files = ["Dockerfile", "run.sh", "stdin.txt", "output"];
      this.stdout = ""; 

      this.begin = this.begin.bind(this);
      this.loadFiles = this.loadFiles.bind(this);
      this.buildDockerContainer = this.buildDockerContainer.bind(this); 
      this.runDockerContainer = this.runDockerContainer.bind(this);
      this.copyFilesFromContainer = this.copyFilesFromContainer.bind(this); 
      this.addFilesToDatabase = this.addFilesToDatabase.bind(this); 
      this.deleteFilesInDatabase = this.deleteFilesInDatabase.bind(this);
      this.removeDockerContainer = this.removeDockerContainer.bind(this); 
      this.removeAfterRunWorkspace = this.removeAfterRunWorkspace.bind(this); 
      this.canRunFiles = this.canRunFiles.bind(this); 
   }

   /**
    * Start the process of compiling and running code.
    * @returns {Promise} Represents whether the code successfully compiled and ran. 
    *    Resolves with output from running code if successful, rejects with error 
    *    message otherwise. 
    */
   begin() {
      return new Promise((resolve, reject) => {
         this.loadFiles()
            .then(result => this.buildDockerContainer())
            .then(result => this.runDockerContainer())
            .then(result => this.copyFilesFromContainer())
            .then(result => this.addFilesToDatabase())
            .then(result => this.deleteFilesInDatabase())
            .then(result => Promise.all([this.removeDockerContainer(), this.removeAfterRunWorkspace()]))
            .then(result => {
               resolve(this.stdout);
            })
            // if an error is thrown at any point during compilation, we still 
            // want to clean up before returning the error 
            .catch(err => {
               Promise.all([this.removeDockerContainer(), this.removeAfterRunWorkspace()])
               // reject with given error regardless of if clean up was successful
               .then(() => {
                  reject(err); 
               })
               .catch(() => {
                  reject(err); 
               })
            });
      });
   }

   /**
    * Step #1: Load files stored in DB onto local file system
    * @returns {Promise} Resolves with all files in addition to stdin.txt if 
    *    files were successfully loaded onto local file system. Rejects with
    *    error otherwise. 
    */
   loadFiles() {

      return new Promise((resolve, reject) => {

         //grab all files from the DB
         this.db.AssignmentFiles.all(this.assignment_id, this.student_id)
            .then(files => {
               if (files.length === 0) {
                  reject("No files found");
               } 

               // create temp workspace directories
               if (fs.existsSync(this.assignment_workspace) === false) {
                  fs.mkdirSync(this.assignment_workspace);
               }
               if (fs.existsSync(this.student_workspace) === false) {
                  fs.mkdirSync(this.student_workspace);
               }
               if (fs.existsSync(this.before_run_workspace) === false) {
                  fs.mkdirSync(this.before_run_workspace);
               }
               if (fs.existsSync(this.after_run_workspace) === false) {
                  fs.mkdirSync(this.after_run_workspace);
               }

               // keep a separate list of files that have been deleted in db and need to be removed 
               let old_files = fs.readdirSync(this.before_run_workspace);
               let files_to_delete = old_files.filter(old_filename => {
                  // we only want to delete this file if it DOESN'T exist in db 
                  // and it's not a docker file 
                  if (this.docker_files.includes(old_filename) || files.some(file => file.file_name === old_filename)) {
                     return false; 
                  }
                  else {
                     return true; 
                  }
               });

               // add stdin as a file
               files.push({ file_name: "stdin.txt", contents: this.stdin });

               // add dockerfile
               files.push({ file_name: "Dockerfile", contents: fs.readFileSync(this.dockerfile_path + "/Dockerfile")});

               // add docker run command (to be used inside of docker container to run program)
               files.push({ file_name: "run.sh", contents: fs.readFileSync(this.dockerfile_path + "/run.sh")});

               // throw files into a temp workspace
               let callback_counter = 0;  
               let total_callbacks = files.length + files_to_delete.length; 

               for (let file of files) {
                  const file_path = this.before_run_workspace + "/" + file.file_name;
                  file.path = file_path;
                  fs.writeFile(file_path, file.contents, { encoding: "utf8" }, (err) => {
                     if (!err) {
                        callback_counter++;
                        if (callback_counter === total_callbacks) {
                           resolve(files);
                        }
                     }
                     else {
                        reject(err);
                     }
                  });
               }

               // delete files from the workspace if they've been removed from db 
               for(let file_name of files_to_delete) {
                  const file_path = this.before_run_workspace + "/" + file_name;
                  fs.unlink(file_path, (err) => {
                     if (!err) {
                        callback_counter++; 
                        if(callback_counter === total_callbacks) {
                           resolve(files);
                        }
                     }
                     else {
                        reject(err); 
                     }
                  })
               }
            })
            .catch(err => {
               reject(err); 
            });
      });
   }

   /**
    * Builds docker container where code will be compiled and run.
    * @returns {Promise} Resolves with output from building docker container if successful.
    *    Rejects with error otherwise. 
    */
   buildDockerContainer() {
      return new Promise((resolve, reject) => {
         const absolute_path = path.resolve(this.before_run_workspace);
         const exe_command = "docker build " + absolute_path + " -t " + this.image_name;
         exec(exe_command, { timeout: this.timeout }, (err, stdout, stderr) => {
            if (!err) {
               resolve(stdout);
            }
            else {
               reject(err);
            }
         });
      });
   }

   /**
    * Runs docker container with untrusted code and copies any files created
    * to the local filesystem.
    * @returns {Promise} Resolves with the result of running container with 
    *    untrusted code if successful. Rejects with error otherwise. 
    */
   runDockerContainer() {
      return new Promise((resolve, reject) => {
         //docker timeout is in seconds whereas nodejs timeout is in milliseconds
         const docker_timeout = this.timeout / 1000;
         const exe_command = "docker run --name " + this.container_name + " " + this.image_name + " timeout " + docker_timeout + " sh -c './run.sh'"; 
         exec(exe_command, { timeout: this.timeout }, (err, stdout, stderr) => {
            if (!err) {
               this.stdout = stdout; 
               resolve(stdout);
            }
            else {
               reject(err);
            }
         });
      });
   }

   /**
    * Copies files from Docker container to local filesystem.
    * @returns {Promise} Resolves with output from command if successful. 
    *    Rejects with error otherwise. 
    */
   copyFilesFromContainer() {
      return new Promise((resolve, reject) => {
         // copy all files from /tmp workspace on container to local filesystem
         const after_run_path = path.resolve(this.after_run_workspace);
         const exe_command = "docker cp " + this.container_name + ":/tmp/. " + after_run_path;
         exec(exe_command, { timeout: this.timeout }, (err, stdout, stderr) => {
            if (!err) {
               resolve(stdout); 
            }
            else {
               reject(err);
            }
         });
      });
   }

   /**
    * Adds any files that were created when running code to database. 
    * @returns {Promise} Resolves if successful. Rejects with error otherwise. 
    */
   addFilesToDatabase() {
      return new Promise((resolve, reject) => {
         let after_files = fs.readdirSync(this.after_run_workspace);

         // for each file that exists in the workspace after executing code: 
         // upload it to the database only if it was created or modified during 
         // runtime, and it's not a Docker file 
         const promises = after_files.map(file => {
            // skip processing if it's a Docker file 
            if(this.docker_files.includes(file) === true) {
               return Promise.resolve(); 
            } 

            let before_run_path = path.resolve(this.before_run_workspace, file);
            let after_run_path = path.resolve(this.after_run_workspace, file);
            let before_stats = null; 
            let after_stats = fs.statSync(after_run_path); 

            // did file exist before running code?
            return access(before_run_path)
            .then(() => {
               // yes -- get its stats 
               before_stats = fs.statSync(before_run_path); 
            })
            .catch(() => {
               // no -- it's just been created  
               before_stats = null; 
            })
            .finally(() => {
               // if the file was created or modified during runtime, upload to db
               if((before_stats === null) || (before_stats.mtimeMs < after_stats.mtimeMs)) {
                  let contents = fs.readFileSync(after_run_path);
                  contents = new Buffer.from(contents).toString(); 
                  return this.db.AssignmentFiles.add(this.student_id, this.assignment_id, file, contents); 
               }
            })
         });

         Promise.all(promises)
         .then(() => {
            resolve(); 
         })
         .catch(err => {
            // some file didn't get added to db properly 
            reject(); 
         })
      });
   }

   /**
    * Soft-deletes any files that were deleted when running code in database. 
    * @returns {Promise} Resolves if successful. Rejects with error otherwise. 
    */
   deleteFilesInDatabase() {
      return new Promise((resolve, reject) => {
         // get a list of files that were deleted in runtime (exist in 
         // before_run_workspace but don't exist in after_run_workspace)
         let before_files = fs.readdirSync(this.before_run_workspace);
         let after_files = fs.readdirSync(this.after_run_workspace);
         let deleted_files = before_files.filter(file => !after_files.includes(file));

         // then remove each of these files for this user 
         let promises = []; 
         for(const file of deleted_files) {
            promises.push(this.db.AssignmentFiles.removePrior(this.student_id, this.assignment_id, file)); 
         }

         Promise.all(promises)
         .then(() => {
            resolve();  
         })
         .catch(err => {
            // some file didn't get deleted from db properly 
            reject(err); 
         })
      });
   }

   /**
    * Deletes Docker container.
    * @returns {Promise} Resolves with output from removing Docker container if 
    *    successful. Rejects with error otherwise. 
    */
   removeDockerContainer() {
      return new Promise((resolve, reject) => {
         // check if container exists 
         this.dockerContainerExists()
         .then(result => {
            if(result === true) {
               // remove Docker container
               const exe_command = "docker rm " + this.container_name;
               exec(exe_command, { timeout: this.timeout }, (err, stdout, stderr) => {
                  if (!err) {
                     resolve(stdout);
                  }
                  else {
                     reject(err);
                  }
               });
            }
            else {
               resolve("container doesn't exist"); 
            }
         })
         .catch(err => {
            reject(err); 
         })
      });
   }

   /**
    * Returns boolean indicating if the Docker container used by this compiler
    * instance exists. Helper function for removeDockerContainer(). 
    * @returns {Promise} Resolves with true or false indicating if the 
    *    container exists if successful. Rejects with error if the Docker command
    *    searching for this container either couldn't be executed or the command
    *    itself threw an error. 
    */
   dockerContainerExists() {
      return new Promise((resolve, reject) => {
         const exe_command = "docker ps -aq -f name=" + this.container_name; 
         exec(exe_command, {timeout: this.timeout}, (err, stdout, stderr) => {
            if(err) {
               reject(err);
            }
            else if(stderr) {
               reject(stderr); 
            }
            else if (stdout) {
               resolve(true); 
            }
            else {
               resolve(false); 
            }
         });
      });
   }

   /**
    * Deletes after_run_workspace directory.
    * @returns {Promise} Resolves if successful. Rejects with error otherwise.
    */
   removeAfterRunWorkspace() {
      return new Promise((resolve, reject) => { 
         rmdir_rf(path.resolve(this.after_run_workspace), (err) => {
            if (!err) {
               resolve("after_run_workspace deleted"); 
            }
            else {
               reject(err); 
            }
         });
      });
   }

   /**
    * If we're just testing the same program against multiple tests, it's wasteful to always
    * compile.  This function tells us if we can run an existing program without a compile
    * by checking to see if the necessary files already exist (i.e. main.exe)
    * @returns {Promise} Resolves with true if the necessary files to run this program already 
    *    exist. Otherwise, if the necessary files don't already exist, we can't run this 
    *    program, so it rejects with error. 
    */
   canRunFiles() {
      return new Promise((resolve, reject) => {

         reject(false);

         //TODO: docker container breaks this functionality.  Need to rewrite.
         const exe_path = this.student_workspace + "/main.exe";
         fs.access(exe_path, fs.constants.F_OK, (err) => {
            if (!err) {
               //create new testing file
               const file_path = this.student_workspace + "/stdin.txt";
               fs.writeFile(file_path, this.stdin, { encoding: "utf8" }, (err) => {
                  if (!err) {
                     resolve(true);
                  }
                  else {
                     reject(err);
                  }
               });
            }
            else {
               reject("main.exe does not exist");
            }
         });
      });
   }
}

/**
 * Contains methods for compiling and running C++ code in a Docker container.
 * @typedef {Object} Compiler 
 */

/**
 * Creates an instance of the compiler. 
 * @param {Object} db Database connection.
 * @param {String} workspace_path Path to directory containing files to compile and run. 
 * @param {Number} assignment_id This code's assignment's ID number (integer). 
 * @param {Number} student_id ID number of the user to whom this code belongs.
 * @param {String} tools_setup_cmd Command for setting up build tools. 
 * @param {String} compile_cmd Command for compiling this code. 
 * @param {String} stdin Input stream to be entered into code. 
 * @returns {Compiler} Compiler using Docker.
 */
exports.createCompiler = function (db, workspace_path, assignment_id, student_id, dockerfile_path, stdin) {
   return new Compiler(db, workspace_path, assignment_id, student_id, dockerfile_path, stdin);
}