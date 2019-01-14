const fs = require('fs');
const { exec, execFile } = require('child_process');
const path = require("path");

class Compiler {
   constructor(db, workspace_path, assignment_id, student_id, tools_setup_cmd, compile_cmd) {
      this.db = db;
      this.workspace_path = workspace_path;
      this.assignment_id = assignment_id;
      this.student_id = student_id;
      this.tools_setup_cmd = tools_setup_cmd;
      this.compile_cmd = compile_cmd;
      this.assignment_workspace = this.workspace_path + "/" + assignment_id;
      this.student_workspace = this.assignment_workspace + "/" + student_id;

      this.compileFiles = this.compileFiles.bind(this);
      this.loadFiles = this.loadFiles.bind(this);
      this.runFiles = this.runFiles.bind(this);
      this.begin = this.begin.bind(this);
   }

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
         this.db.AssignmentFiles.all(this.assignment_id, this.student_id, (files) => {

            if (files.length === 0) {
               reject("No files found");
            }

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
         const bat_commands = "CALL \"" + this.tools_setup_cmd + "\"\r\n" +
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
         execFile(exe_path, [], {timeout: 15000}, (error, stdout, stderr) => {
            if (!error) {
               resolve(stdout);
            }
            else {
               reject(error);
            }
         });
      });
   }
}

exports.createCompiler = function (db, workspace_path, assignment_id, student_id, tools_setup_cmd, compile_cmd) {
   return new Compiler(db, workspace_path, assignment_id, student_id, tools_setup_cmd, compile_cmd);
}