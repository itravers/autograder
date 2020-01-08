const fs = require('fs');
const { exec, execFile, spawn, onExit } = require('child_process');
const path = require("path");

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
      this.stdin = stdin;
      this.timeout = timeout;

      this.begin = this.begin.bind(this);
      this.loadFiles = this.loadFiles.bind(this);
      this.buildDockerContainer = this.buildDockerContainer.bind(this); 
      this.runDockerContainer = this.runDockerContainer.bind(this);
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
            .then(result => {
               resolve(result);
            })
            .catch(err => {
               reject(err);
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

               //add stdin as a file
               files.push({ file_name: "stdin.txt", contents: this.stdin });

               //add dockerfile
               files.push({ file_name: "Dockerfile", contents: fs.readFileSync(this.dockerfile_path + "/Dockerfile")});

               //add docker run command (to be used inside of docker container to run program)
               files.push({ file_name: "run.sh", contents: fs.readFileSync(this.dockerfile_path + "/run.sh")});

               //and throw them into a temp workspace
               let write_counter = 0;

               if (fs.existsSync(this.assignment_workspace) === false) {
                  fs.mkdirSync(this.assignment_workspace);
               }
               if (fs.existsSync(this.student_workspace) === false) {
                  fs.mkdirSync(this.student_workspace);
               }
               for (let file of files) {
                  const file_path = this.student_workspace + "/" + file.file_name;
                  file.path = file_path;
                  fs.writeFile(file_path, file.contents, { encoding: "utf8" }, (err) => {
                     if (!err) {
                        write_counter++;
                        if (write_counter === files.length) {
                           resolve(files);
                        }
                     }
                     else {
                        reject(err);
                     }
                  });
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

         const absolute_path = path.resolve(this.student_workspace);
         const image_name = "cpp_" + this.assignment_id + "_" + this.student_id;
         const exe_command = "docker build " + absolute_path + " -t " + image_name;
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
    * Runs docker container with untrusted code. 
    * @returns {Promise} Resolves with the result of running container with 
    *    untrusted code if successful. Rejects with error otherwise. 
    */
   runDockerContainer() {
      return new Promise((resolve, reject) => {

         //create BATCH file
         const absolute_path = path.resolve(this.student_workspace);
         const image_name = "cpp_" + this.assignment_id + "_" + this.student_id;

         //docker timeout is in seconds whereas nodejs timeout is in milliseconds
         const docker_timeout = this.timeout / 1000;
         const exe_command = "docker run --rm " + image_name + " timeout " + docker_timeout + " sh -c './run.sh'";

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
    * If we're just testing the same program against multiple tests, it's wasteful to always
    * compile.  This function tells us if we can run an existing program without a compile
    * by checking to see if the necessasry files already exist (i.e. main.exe)
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
 * Contains methods for compiling and running C++ code in Windows using Docker.
 * @typedef {Object} Compiler 
 */

/**
 * Creates an instance of the Windows MSVC compiler. 
 * @param {Object} db Database connection.
 * @param {String} workspace_path Path to directory containing files to compile and run. 
 * @param {Number} assignment_id This code's assignment's ID number (integer). 
 * @param {Number} student_id ID number of the user to whom this code belongs.
 * @param {String} tools_setup_cmd Command for setting up build tools. 
 * @param {String} compile_cmd Command for compiling this code. 
 * @param {String} stdin Input stream to be entered into code. 
 * @returns {Compiler} Windows MSVC compiler using Docker.
 */
exports.createCompiler = function (db, workspace_path, assignment_id, student_id, dockerfile_path, stdin) {
   return new Compiler(db, workspace_path, assignment_id, student_id, dockerfile_path, stdin);
}