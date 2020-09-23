let fs = require('fs'); 
let archiver = require('archiver'); 

/** 
 * Retrieves all files for the specified assignment and user (if allowed to grade).
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection.
 * @param {Object} acl Object containing AccessControlList methods. 
 * @returns {Object} JSON response containing all files, or status code indicating error. 
 */
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

/** 
 * Compiles & runs student's code.
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection.
 * @param {Object} config config.ini settings  
 * @param {Object} acl Object containing AccessControlList methods.
 * @param {Object} Compiler Methods for compiling and running. 
 * @returns {Object} JSON with the result of running student's code.
 */
exports.compileAndRun = function(req, res, db, config, acl, Compiler) {
   let session = req.session;
   const current_user = session.user;
   const assignment_id = req.params.assignment_id;
   const dockerfile_path = "Models/compilers/cpp_clang";
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
            dockerfile_path,
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
 * Creates a test case. 
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection. 
 * @param {Object} acl Object containing AccessControlList methods.
 * @returns {Object} JSON response with test case's ID if successful, or
 *    with error message if unsuccessful for any reason.
 */
exports.createTestCase = function(req, res, db, acl) {
   let session = req.session;
   
   const a_id = req.params.assignment_id;
   const test_id = req.body.test_id; 
   const test_name = req.body.test_name; 
   const test_input = req.body.test_input; 
   const test_description = req.body.test_description;

   // get course id for this assignment to check if user can edit this 
   // assignment's test cases
   db.Assignments.assignmentInfo(a_id)
      .then((result) => acl.canModifyCourse(session.user, result.course_id))
      .catch(() => {
         res.json({response: 'cannot modify course'}); 
      })
      // does this test case already exist for this assignment?
      .then(() => db.Assignments.TestCases.isUnique(a_id, test_id))

      // if the test case doesn't exist yet, add it to the database
      .then(() =>  db.Assignments.TestCases.createTest(a_id, test_name, test_input, test_description))
      .then(
         result => res.json({ response: result })
      )
      .catch(err => {
         // if err === false, this catch came from "isUnique()"-- then the test 
         // case already exists and we should modify it 
         if(err === false)
         {
            exports.editTestCase(req, res, db, acl); 
         }
         else
         {
            res.json({response: err});
         }
      });
}

/**
 * Checks if a given assignment for a given user has tests run with outdated versions of files for that assignment and user.
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection. 
 * @param {Object} acl Object containing AccessControlList methods.
 * @returns {Object} JSON response with test case's ID if successful, or
 *    with error message if unsuccessful for any reason.
 */
exports.dateMismatch = function(req, res, db, acl) {
   let session = req.session;
   const current_user = session.user;
   const assignment_id = req.params.aid;
   const user_id = req.params.uid;
   const test_name = req.params.test;

   // if user is logged in
   acl.isLoggedIn(session)

      //and this user can grade
      .then(() => acl.canGradeAssignment(current_user, assignment_id))

      //then make the call
      .then(() => {
         db.Assignments.TestCases.dateMismatch(assignment_id, user_id, test_name)
            .then(result => {
               res.json({ response: result });
            })
            .catch(err => {
               res.json({ response: err });
            });
         })
      .catch((error) => {
         return res.status(500).send(error);
      });
}


/** 
 * Download student files for the given assignment.
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection.
 * @returns {Object} JSON containing test files for the assignment, or error message. 
 */
exports.downloadFiles = function(req, res, db, acl) {
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
      .then(() => db.AssignmentFiles.downloadFiles(req.params.assignment_id))
      .then(results => {
         res.json({ response: results });
      })
      .catch(err => {
         res.json({ response: err });
      });
}


/** 
 * Download student results for the given assignment.
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection.
 * @returns {Object} JSON containing test results for the assignment, or error message. 
 */
exports.downloadResults = function(req, res, db, acl) {
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
      .then(() => db.Assignments.TestCases.downloadResults(req.params.assignment_id))
      .then(result => {
         res.json({ response: result });
      })
      .catch(err => {
         res.json({ response: err });
      });
}


 /**
  * Deletes a file from an assignment. :aid is the assignment ID that this file will belong to.   
  * The file ID to delete should be in req.body.id.
  * @param {Object} req HTTP request object. 
  * @param {Object} res HTTP response object. 
  * @param {Object} db Database connection.
  * @param {Object} acl Object containing AccessControlList methods.
  * @returns {Object} JSON containing the deleted file's ID, or a 500 status code.
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

/**
 * Edits a test case. 
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection. 
 * @param {Object} acl Object containing AccessControlList methods.
 * @returns {Object} JSON response with number of rows edited if successful, or
 *    with error message if unsuccessful for any reason.
 */
exports.editTestCase = function(req, res, db, acl) {
   let session = req.session; 
   const a_id = req.params.assignment_id;
   const test_id = req.body.test_id; 
   const test_name = req.body.test_name; 
   const test_input = req.body.test_input; 
   const test_desc = req.body.test_description;

   // get course id for this assignment to check if user can edit this 
   // assignment's test cases
   db.Assignments.assignmentInfo(a_id)
      .then((result) => acl.canModifyCourse(session.user, result.course_id))

      // update the test's information in the database
      .then(() => db.Assignments.TestCases.editTest(a_id, test_id, test_name, test_input, test_desc))
      .then(
         result => res.json({ response: result })
      )
      .catch(err =>
         res.json({ response: err })
      );
}

   /**
  * Marks assignment as submitted. :aid is the assignment ID.   
  * The assignment ID to modify should be in req.body.id.
  * @param {Object} req HTTP request object. 
  * @param {Object} res HTTP response object. 
  * @param {Object} db Database connection.
  * @param {Object} acl Object containing AccessControlList methods.
  * @returns {Object} JSON containing the modified assignment's ID, or a 500 status code.
  */
 exports.submitAssignment = function(req, res, db, acl) {
   let session = req.session;
   const current_user = session.user;
   const assignment_id = req.params.assignment_id;

   //do we have an active user?
   acl.isLoggedIn(session)

      //and this user can access the current assignment
      .then(() => acl.userHasAssignment(current_user, assignment_id))

      //then make the call
      .then(() => {

         db.AssignmentFiles.submitAssignment(assignment_id, current_user.id)
            .then(() => {
               return res.json({ response: assignment_id }); 
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

/**
  * Toggles assignment's locked status. :aid is the assignment ID.   
  * The assignment ID to modify should be in req.body.id.
  * @param {Object} req HTTP request object. 
  * @param {Object} res HTTP response object. 
  * @param {Object} db Database connection.
  * @param {Object} acl Object containing AccessControlList methods.
  * @returns {Object} JSON containing the locked/unlocked assignment's ID, or a 500 status code.
  */
 exports.lockAssignment = function(req, res, db, acl) {
   let session = req.session;
   const assignment_id = req.params.assignment_id;

   //do we have an active user?
   acl.isLoggedIn(session)

      //and this user is admin
      .then(() => acl.isAdmin(session))

      //then make the call
      .then(() => {
          db.Assignments.lockAssignment(assignment_id)
            .then(() => {
            return res.json({ assignment: assignment_id }); 
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

/**
  * Checks assignment's locked status. :aid is the assignment ID.   
  * The assignment ID to check should be in req.body.id.
  * @param {Object} req HTTP request object. 
  * @param {Object} res HTTP response object. 
  * @param {Object} db Database connection.
  * @returns {Object} JSON containing the locked/unlocked assignment's ID, or a 500 status code.
  */
 exports.isLocked = function(req, res, db) {
   let session = req.session;
   const assignment_id = req.params.assignment_id;

   db.Assignments.isLocked(assignment_id)
      .then(() => {
         return res.json({ assignment: assignment_id }); 
      })
      .catch(err => {
         console.log(err);
         return res.status(500).send("Error");
      });
}


/** 
 * Get test cases for the given assignment.
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection.
 * @returns {Object} JSON containing test cases for the assignment, or error message. 
 */
exports.getTestCases = function(req, res, db) {
    db.Assignments.TestCases.forAssignment(req.params.assignment_id)
      .then(result => {
         res.json({ response: result });
      })
      .catch(err => {
         res.json({ response: err });
      });
 }
 
 /** 
  * Gets user's test results for this assignment, if the user has permission
  * to view them.
  * @param {Object} req HTTP request object. 
  * @param {Object} res HTTP response object. 
  * @param {Object} db Database connection.
  * @param {Object} acl Object containing AccessControlList methods.
  * @returns {Object} JSON with user's test results, or an error if user doesn't
  *   have permission to view them. 
  */
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
 
 /** 
  * Runs student's code without compiling first (saves time).
  * @param {Object} req HTTP request object. 
  * @param {Object} res HTTP response object. 
  * @param {Object} db Database connection.
  * @param {Object} config config.ini settings  
  * @param {Object} acl Object containing AccessControlList methods.
  * @param {Object} Compiler Methods for compiling and running. 
  * @returns {Object} JSON with the result of running student's code.
  */
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
 
/** 
 * Uploads a file. :aid is the assignment ID that this file will belong to.
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection.
 * @param {Object} acl Object containing AccessControlList methods.
 * @returns {Object} Responds with new file's ID number if successful, or 
 *    500 status code with corresponding error message otherwise. 
 */
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

 /** 
 * Download and compress student results and files for the given assignment.
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection.
 * @returns {Object} JSON containing assignment's id if successful, or error otherwise.  
 */
exports.zipGradingFiles = function(req, res, db, acl) {
   const assignment_id = req.params.assignment_id; 
   let assignment; 

   // get course id for this assignment 
   db.Assignments.assignmentInfo(assignment_id)
   .then(result => {
      assignment = result; 
   })

   // check if current user has permission to view grading files 
   .then(() => acl.canGradeAssignment(req.session.user, assignment.course_id))
   
   // download all needed data locally first 
   .then(() => db.AssignmentFiles.downloadFiles(assignment_id))
   .then(() => db.Assignments.TestCases.downloadResults(assignment_id))

   // get the assignment's name, as this is the name of the subdirectory 
   // containing its files 
   .then(() => {
      // then start streaming data  to local zip file 
      let output = fs.createWriteStream('../data/Grading/' + assignment.name + '.zip'); 
      let archive = archiver('zip', {
         zlib: { level: 9 } // Sets the compression level.
       });

      // listen for all archive data to be written
      // 'close' event is fired only when a file descriptor is involved
      output.on('close', function() {
         console.log(archive.pointer() + ' total bytes');
         console.log('archiver has been finalized and the output file descriptor has closed.');
      });
      
      // This event is fired when the data source is drained no matter what was the data source.
      // It is not part of this library but rather from the NodeJS Stream API.
      // @see: https://nodejs.org/api/stream.html#stream_event_end
      output.on('end', function() {
         console.log('Data has been drained');
      });
      
      // good practice to catch warnings (ie stat failures and other non-blocking errors)
      archive.on('warning', function(err) {
         if (err.code === 'ENOENT') {
            // log warning
            console.log('Warning: file/directory not found'); 
         } 
         else {
            // throw error
            throw err;
         }
      });
      
      // good practice to catch this error explicitly
      archive.on('error', function(err) {
         throw err;
      });
      
      // pipe archive data to the file
      archive.pipe(output);
            
      // append files from the sub-directory corresponding to this assignment 
      // to the archive 
      archive.directory('../data/Grading/' + assignment.name, false); 

      // finalize the archive (ie we are done appending files but streams have to finish yet)
      archive.finalize();

      // TODO: 
      // 1. get the URL to the zip file we just created 
         // a. get the port number 
         // b. append to "localhost:" (for now)
         // c. add path to file as described above: '/data/Grading/' + assignment.name
            // i. could create a local variable to hold this path, to make it easier 
      // 2. res.json(response: [url generated above])

      console.log(req.headers.host); 

      res.json({response: assignment.id}); 
   })
   .catch(err => {
      res.json({ response: err });
   });

   
}