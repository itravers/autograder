const fs = require('fs');
const { exec, execFile, spawn, onExit } = require('child_process');
const path = require("path");

/**
 * Constructor for Mac Clang compiler.
 * @param {Object} db Database connection.
 * @param {String} workspace_path Path to directory containing files to compile and run. 
 * @param {Number} assignment_id This code's assignment's ID number (integer). 
 * @param {Number} student_id ID number of the user to whom this code belongs.  
 * @param {String} tools_setup_cmd Command for setting up build tools. 
 * @param {String} compile_cmd Command for compiling this code. 
 * @param {String} stdin Input stream to be entered into code. 
 */
class Compiler {
   constructor(db, workspace_path, assignment_id, student_id, tools_setup_cmd, compile_cmd, stdin) {
      this.db = db;
      this.workspace_path = workspace_path;
      this.assignment_id = assignment_id;
      this.student_id = student_id;
      this.tools_setup_cmd = tools_setup_cmd;
      this.compile_cmd = compile_cmd;
      this.assignment_workspace = this.workspace_path + "/" + assignment_id;
      this.student_workspace = this.assignment_workspace + "/" + student_id;
      this.stdin = stdin;

      this.begin = this.begin.bind(this);
      this.loadFiles = this.loadFiles.bind(this);
      this.compileFiles = this.compileFiles.bind(this);
      this.runFiles = this.runFiles.bind(this);
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
            .then(files => this.compileFiles())
            .then(result => this.runFiles())
            .then(result => {
               resolve(result);
            })
            .catch(err => {
               reject(err);
            });
      });
   }

   /**
    * Step #1: Load files stored in DB onto local file system.
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
               files.push({file_name: "stdin.txt", contents: this.stdin});

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
    * Step #2: compile files after loading from the DB.
    * @returns {Promise} Resolves with output from compiler if successful; 
    *    rejects with error otherwise. 
    */
   compileFiles() {
      return new Promise((resolve, reject) => {

         const sh_commands = "clang++ -std=c++14 ../data/temp/1/1/*.cpp -o main";

         exec(sh_commands, (err, stdout, stderr) => {
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
    * Step #3: Run compiled program.
    * @returns {Promise} If program took stdin as input and ran successfully, 
    *    Promise resolves with output from running program. Otherwise, Promise 
    *    rejects with error encountered. 
    */
   runFiles() {
      return new Promise((resolve, reject) => {
         const exe_path = this.student_workspace + "/main";         
         const sh_commands = "./main < ../data/temp/1/1/stdin.txt";

         exec(sh_commands, {timeout: 15000}, (err, stdout, stderr) => {
            if (!err) {
               resolve(stdout);
            }
            else {
               reject(err);
            }
         })
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
   canRunFiles(){
      return new Promise((resolve, reject) => {
         const exe_path = this.student_workspace + "/main";  
         fs.access(exe_path, fs.constants.F_OK, (err) =>{
            if(!err){
               //create new testing file
               const file_path = this.student_workspace + "/stdin.txt";
               fs.writeFile(file_path, this.stdin, { encoding: "utf8" }, (err) => {
                  if(!err){
                     resolve(true);
                  }
                  else{
                     reject(err);
                  }
               });
            }
            else{
               reject("main.exe does not exist");
            }
         });
      });
   }
}

/**
 * Contains methods for compiling and running C++ code on Mac using Clang.
 * @typedef {Object} Compiler 
 */

/**
 * Creates an instance of the Mac Clang compiler. 
 * @param {Object} db Database connection.
 * @param {String} workspace_path Path to directory containing files to compile and run. 
 * @param {Number} assignment_id This code's assignment's ID number (integer). 
 * @param {Number} student_id ID number of the logged-in user who is running this code. 
 * @param {String} tools_setup_cmd Command for setting up build tools. 
 * @param {String} compile_cmd Command for compiling this code. 
 * @param {String} stdin Input stream to be entered into code. 
 * @returns {Compiler} Mac Clang compiler. 
 */
exports.createCompiler = function (db, workspace_path, assignment_id, student_id, tools_setup_cmd, compile_cmd, stdin) {
   return new Compiler(db, workspace_path, assignment_id, student_id, tools_setup_cmd, compile_cmd, stdin);
}