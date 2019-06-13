// Retrieves all files for the specified assignment and user (if allowed to grade)
exports.assignmentFiles = function(req, res, db, acl) {
   let session = req.session;
   const current_user = session.user;
   const assignment_id = req.params.aid;
   const user_id = req.params.uid;
   let has_error = false;

   //do we have an active user?
   acl.isLoggedIn(session)

      //and this user can access the current assignment
      .then(() => acl.userHasAssignment(current_user, assignment_id))

      .catch(() => {
         has_error = true;
         return has_error;
      })

      //if this succeeds, allow caller to use the specified user ID.  Otherwise, just
      //use the caller's ID instead
      .then((result) => acl.canGradeAssignment(current_user, result.course_id))
      .then(() => db.AssignmentFiles.all(assignment_id, user_id))
      .then(data => { 
         return res.json({ response: data });
      })
      .catch(() => {

         //only run if first catch was not triggered
         if (has_error === false) {
            db.AssignmentFiles.all(assignment_id, current_user.id)
            .then(data => { 
               return res.json({ response: data });
            })
            .catch(err => {
               return res.status(500).send("Error");
            });
         }
         else {
            return res.status(500).send("Error");
         }
      });
}

//compiles & runs student's code
exports.compileAndRun = function(req, res, db, config, acl, Compiler) {
   let session = req.session;
   const current_user = session.user;
   const assignment_id = req.params.assignment_id;
   const tools_command = config.compiler.tools_path + "\\" + config.compiler.tools_batch;
   const compile_cmd = config.compiler.compile_command;
   const stdin = req.body.stdin;
   const test_name = req.body.test_name;

   //do we have an active user?
   acl.isLoggedIn(session)

      //and this user can access the current assignment
      .then(() => acl.userHasAssignment(current_user, assignment_id))

      //then, try to compile and build the assignment
      .then(() => {
         let compiler = Compiler.createCompiler(
            db,
            config.temp_path,
            req.params.assignment_id,
            current_user.id,
            tools_command,
            compile_cmd,
            stdin
         );
         return compiler.begin();
      })

      // log test results in database 
      .then((result) => {
         db.Assignments.TestCases.log(assignment_id, current_user.id, test_name, stdin, result)
            .then(() => {
               res.json({ response: result });
            })
            .catch(log_err => {
               res.json({ response: log_err });
            });
      })
      .catch((err) => {
         db.Assignments.TestCases.log(assignment_id, current_user.id, test_name, stdin, err.message)
            .then(() => {
               res.json({ response: err.message });
            })
            .catch(log_err => {
               res.json({ response: log_err });
            });
      });
}

 /**
  * :aid is the assignment ID that this file will belong to.   The file ID to delete 
  * should be in req.body.id.
  */
 exports.deleteFile = function(req, res, db, acl) {
   let session = req.session;
   const current_user = session.user;
   const file_id = req.body.id;

   //do we have an active user?
   acl.isLoggedIn(session)

      //and this user can access the current assignment
      .then(() => acl.userOwnsFile(current_user, file_id))

      //then make the call
      .then(() => {

         db.AssignmentFiles.remove(file_id)
            .then(() => {
               return res.json({ response: file_id }); 
            })
            .catch(err => {
               console.log(err);
               return res.status(500).send("Error");
            });
      })
      .catch((error) => {
         return res.status(500).send("Error");
      });
}

// get test cases for the given assignment 
exports.getTestCases = function(req, res, db) {
    db.Assignments.TestCases.forAssignment(req.params.assignment_id)
      .then(result => {
         res.json({ response: result });
      })
      .catch(err => {
         res.json({ response: err });
      });
 }
 
 // gets user's test results for this assignment, if the user has permission
 // to view them 
 exports.getTestResults = function(req, res, db, acl) {
    let session = req.session;
    let user_id = req.params.user_id;
    const assignment_id = req.params.assignment_id;
    acl.isLoggedIn(session)
       .then(() => {
          //admins and instructors are allowed to look at others' stuff.  Students not.
          if (session.user.is_instructor !== 1 && session.user.is_admin !== 1) {
             user_id = session.user.id;
          }
       })
       .then(() => db.Assignments.TestCases.testResults(assignment_id, user_id))
       .then(results => {
          res.json({ response: results });
       })
       .catch(err => {
          res.json({ response: err });
       });
 }
 
 //runs student's code without compiling first (saves time)
 exports.run = function(req, res, db, config, acl, Compiler)  {
    let session = req.session;
    const current_user = session.user;
    const assignment_id = req.params.assignment_id;
    const tools_command = config.compiler.tools_path + "\\" + config.compiler.tools_batch;
    const compile_cmd = config.compiler.compile_command;
    const stdin = req.body.stdin;
    const test_name = req.body.test_name;
 
    //do we have an active user?
    acl.isLoggedIn(session)
 
       //and this user can access the current assignment
       .then(() => acl.userHasAssignment(current_user, assignment_id))
 
       //then, try to compile and build the assignment
       .then(() => {
          let compiler = Compiler.createCompiler(
             db,
             config.temp_path,
             req.params.assignment_id,
             current_user.id,
             tools_command,
             compile_cmd,
             stdin
          );
          return compiler.canRunFiles()
             .then(() => compiler.runFiles());
       })
       
       // log test results in database 
      .then((result) => {
         db.Assignments.TestCases.log(assignment_id, current_user.id, test_name, stdin, result)
            .then(() => {
               res.json({ response: result });
            })
            .catch(log_err => {
               res.json({ response: log_err });
            });
      })
      .catch((err) => {
         db.Assignments.TestCases.log(assignment_id, current_user.id, test_name, stdin, err.message)
            .then(() => {
               res.json({ response: err.message });
            })
            .catch(log_err => {
               res.json({ response: log_err });
            });
      });
 }
 
// Uploads a file. :aid is the assignment ID that this file will belong to.
exports.uploadFile = function(req, res, db, acl) {
    const current_user = req.session.user;
    const assignment_id = req.params.aid;
    const uploaded_file = req.files.filepond;
    let session = req.session;
 
    //make sure user can upload to this assignment
    acl.isLoggedIn(session)
 
       //and belongs to the current assignment
       .then(() => acl.userHasAssignment(current_user, assignment_id))

       //then allow them to upload the file
       .then(() => {
          let buffer_data = Buffer.from(uploaded_file.data);
          const text = buffer_data.toString('utf8');

          db.AssignmentFiles.add(current_user.id, assignment_id, uploaded_file.name, text)
            .then(result => {
               res.type('html').send(String(result));
            })
            .catch(err => {
               return res.status(500).send(err);
            });
       })
       .catch(() => {
          return res.status(500).send("Invalid user");
       });
 }