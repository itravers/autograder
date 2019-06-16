const fs = require('fs');
const { exec, execFile, spawn, onExit } = require('child_process');
const path = require("path");

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
      this.canRunFiles = this.runFiles.bind(this); 
   }

   /**
    * Start the process of compiling and running code.
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
    * Step #1: Load files stored in DB onto local file system
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
    * Step #2: compile files after loading from the DB
    */
   compileFiles() {
      return new Promise((resolve, reject) => {
         //create BATCH file
         const absolute_path = path.resolve(this.student_workspace);
         const bat_path = absolute_path + "/compile.bat";
         const bat_commands = "@ECHO OFF\r\n" + 
         "CALL " + this.tools_setup_cmd + "\r\n" + //AC Note: had to remove escaped quotes on work PC.  Needed for home PC?
            "CD \"" + absolute_path + "\"\r\n" +
            this.compile_cmd;
         
         fs.writeFile(bat_path, bat_commands, { encoding: "utf8" }, (err) => {
            if (!err) {
               exec(bat_path, (err, stdout, stderr) => {
                  if (!err) {
                     resolve(stdout);
                  }
                  else {
                     reject(err);
                  }
               });
            }
            else {
               reject(err);
            }
         });
      });
   }

   /**
    * Step #3: Run compiled program
    */
   runFiles() {
      return new Promise((resolve, reject) => {
         const exe_path = this.student_workspace + "/main.exe";         

         //create BATCH file
         const absolute_path = path.resolve(this.student_workspace);
         const bat_path = absolute_path + "/run.bat";
         const bat_commands = "@ECHO OFF\r\n" +
            "CD \"" + absolute_path + "\"\r\n" +
            "main.exe < stdin.txt";
         
         fs.writeFile(bat_path, bat_commands, { encoding: "utf8" }, (err) => {
            if (!err) {
               exec(bat_path, {timeout: 15000}, (err, stdout, stderr) => {
                  if (!err) {
                     resolve(stdout);
                  }
                  else {
                     reject(err);
                  }
               })
            }
         });
      });
   }

   /**
    * If we're just testing the same program against multiple tests, it's wasteful to always
    * compile.  This function tells us if we can run an existing program without a compile
    * by checking to see if the necessasry files already exist (i.e. main.exe)
    */
   canRunFiles(){
      return new Promise((resolve, reject) => {
         const exe_path = this.student_workspace + "/main.exe";  
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

exports.createCompiler = function (db, workspace_path, assignment_id, student_id, tools_setup_cmd, compile_cmd, stdin) {
   return new Compiler(db, workspace_path, assignment_id, student_id, tools_setup_cmd, compile_cmd, stdin);
}