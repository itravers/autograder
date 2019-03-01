// server.js

//tutorials:
//express: https://scotch.io/tutorials/build-a-restful-api-using-node-and-express-4 
//sqlite3: http://www.sqlitetutorial.net/sqlite-nodejs/

// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const ini = require('ini');
const session = require('express-session');
const FileManager = require('./FileManager.js');
const Database = require('./Models/Database.js');
const AccessControlList = require('./Models/AccessControlList.js');
const Compiler = require('./Models/Compiler.js');
var FileStore = require('session-file-store')(session);


let config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
config.database.connection_string = config.database.db_path + config.database.db_name;;
let file_manager = FileManager.FileManager(config.temp_path, config.uploads_path);
let db = Database.createDatabase(config.database.connection_string, config.database.secret_hash, config.database.crypto_method);
let acl = AccessControlList.createACL(db);

/* 
process.on('unhandledRejection', (reason, p) => {
   console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
   // application specific logging, throwing an error, or other logic here
 });
 */

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

let cookie = { secure: false, httpOnly: false };
app.use(session({
   store: new FileStore({path: config.session_path, ttl: 86400}),
   secret: config.database.secret_hash,
   resave: false,
   saveUninitialized: false,
   cookie: cookie
}));

var port = process.env.PORT || 8080;        // set our port

if (config.mode === "debug") {
   console.log("running in debug mode.");
}

app.use((req, res, next) => {

   //Allow CORS from react (not safe for production)
   if (config.mode === "debug") {
      const origin = req.get('origin');
      res.header('Access-Control-Allow-Origin', origin);
   }

   res.header('Access-Control-Allow-Credentials', true);
   res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, HEAD, OPTIONS');
   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');



   // intercept OPTIONS method
   if (req.method === 'OPTIONS') {
      res.sendStatus(204);
   } else {
      next();
   }
});


// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', (req, res) => {
   res.json({ message: 'hooray! welcome to our api!' });
});

router.get('/assignment/testCases/:assignment_id', (req, res) => {
   db.Assignments.TestCases.forAssignment(req.params.assignment_id, (result, err) => {
      if (!err) {
         res.json({ response: result });
      }
      else {
         res.json({ response: err });
      }
   });
});

//runs student's code without compiling first (saves time)
router.post('/assignment/run/:assignment_id', (req, res) => {
   let session = req.session;
   const current_user = session.user;
   const assignment_id = req.params.assignment_id;
   const tools_command = config.compiler.tools_path + "\\" + config.compiler.tools_batch;
   const compile_cmd = config.compiler.compile_command;
   const stdin = req.body.stdin;

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
      .then((result) => {
         db.Assignments.TestCases.log(assignment_id, current_user.id, stdin, result, () => {
            res.json({ response: result });
         });
      })
      .catch((err) => {
         db.Assignments.TestCases.log(assignment_id, current_user.id, stdin, err.message, () => {
            res.json({ response: err.message });
         });
      });
});

//compiles & runs student's code
router.post('/assignment/compile/:assignment_id', (req, res) => {
   let session = req.session;
   const current_user = session.user;
   const assignment_id = req.params.assignment_id;
   const tools_command = config.compiler.tools_path + "\\" + config.compiler.tools_batch;
   const compile_cmd = config.compiler.compile_command;
   const stdin = req.body.stdin;

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
      .then((result) => {
         db.Assignments.TestCases.log(assignment_id, current_user.id, stdin, result, () => {
            res.json({ response: result });
         });
      })
      .catch((err) => {
         db.Assignments.TestCases.log(assignment_id, current_user.id, stdin, err.message, () => {
            res.json({ response: err.message });
         });
      });
});

/**
 * Retrieves all files for the specified assignment
 */
router.get('/assignment/file/:id', (req, res) => {
   let session = req.session;
   const current_user = session.user;
   const assignment_id = req.params.id;

   //do we have an active user?
   acl.isLoggedIn(session)

      //and this user can access the current assignment
      .then(() => acl.userHasAssignment(current_user, assignment_id))

      //then make the call
      .then(() => {
         db.AssignmentFiles.all(assignment_id, current_user.id, (data) => {
            res.json({ response: data });
         });
      })
      .catch((error) => {
         return res.status(500).send("Error");
      });
});

/**
 * Uploads a file. :id is the assignment ID that this file will belong to.
 */
router.post('/assignment/file/:id', (req, res) => {
   const current_user = req.session.user;
   const assignment_id = req.params.id;
   const uploaded_file = req.files.filepond;
   let session = req.session;

   //make sure user can upload to this assignment
   acl.isLoggedIn(session)

      //and belongs to the current assignment
      .then(result => acl.userHasAssignment(current_user, assignment_id))

      //then allow them to upload the file
      .then(result => {
         let buffer_data = Buffer.from(uploaded_file.data);
         const text = buffer_data.toString('utf8');
         db.AssignmentFiles.add(current_user.id, assignment_id, uploaded_file.name, text, (result, err) => {
            if (result !== null) {
               res.type('html').send(String(result));
            }
            else {
               return res.status(500).send(err);
            }
         });
      })
      .catch(() => {
         return res.status(500).send("Invalid user");
      });
});

/**
 * :id is the assignment ID that this file will belong to.   The file ID to delete 
 * should be in req.body.id.
 */
router.delete('/assignment/file/:id', (req, res) => {
   let session = req.session;
   const current_user = session.user;
   const file_id = req.body.id;

   //do we have an active user?
   acl.isLoggedIn(session)

      //and this user can access the current assignment
      .then(() => acl.userOwnsFile(current_user, file_id))

      //then make the call
      .then(() => {
         db.AssignmentFiles.remove(file_id, (changes, err) => {
            if (err === null) {
               return res.json({ response: file_id });
            }
            else {
               console.log(err);
               return res.status(500).send("Error");
            }
         });
      })
      .catch((error) => {
         return res.status(500).send("Error");
      });

});

//Returns all available courses
router.get('/course', (req, res) => {
   db.Courses.all((result) => { res.json({ response: result }); });
});

//AC note: used to create courses.  Not finished
router.post('/course', (req, res) => {
   let session = req.session;
   const school_id = req.body.school_id;
   const name = req.body.name;
   const term = req.body.term;
   const year = req.body.year;
   acl.isAdmin(session)
      .then(() => db.Courses.isUnique(school_id, name, term, year))
      .then((result) => {
         return res.json({ response: result });
      })
      .catch((result) => res.json({ response: { result } }));
});

router.get('/course/assignments/active/:id', (req, res) => {
   const course_id = req.params.id;
   db.Courses.assignments(course_id, (result) => {
      res.json({ response: result });
   });
});

/**
 * Returns all courses that the currently logged in user is taking
 */
router.get('/course/user', (req, res) => {
   const current_user = req.session.user;
   if (current_user !== undefined) {
         db.Courses.forUser(current_user.id, (result) => {
            res.json({ response: result });
         });
   }
   else {
      res.json({ response: {} });
   }
});

/**
 * Returns a detailed roster for all courses where the user has 
 * instructor rights
 */
router.get('/course/user/:course_id', (req, res) => {
   const course_id = req.params.course_id;
   let session = req.session;
   acl.isLoggedIn(session)

   .then(() => acl.canModifyCourse(session.user, course_id)) 
   .then(() => db.Courses.courseUsers(course_id))
   .then(result => {
      res.json({ response: result });
   })
   .catch(err => res.json({ response: err }));
});

/**
 * Removes the user specified in req.body from the selected course
 */
router.delete('/course/user/:course_id', (req, res) => {
   const course_id = req.params.course_id;
   const user_id = req.body.user_id;
   let session = req.session;

   acl.isLoggedIn(session)
      .then(acl.isSessionUser(session, user_id))
      .then(db.Courses.removeUser(course_id, user_id))
      .then(
         result => res.json({ response: result })
      )
      .catch(err => res.json({ response: err }));
});

/**
 * Adds the user to the specified course
 */
router.post('/course/user/:course_id', (req, res) => {
   const course_id = req.params.course_id;
   const user_id = req.body.user_id;
   let session = req.session;

   acl.isLoggedIn(session)
      .then(acl.isSessionUser(session, user_id))
      .then(db.Courses.addUser(course_id, user_id))
      .then(
         result => res.json({ response: result })
      )
      .catch(err => {
         res.json({ response: err });
      });
});

/**
 * Alters user's course role
 */
router.put('/course/user/:course_id', (req, res) => {
   const course_id = req.params.course_id;
   const user_id = req.body.user_id;
   const role = req.body.role;
   let session = req.session;

   acl.isLoggedIn(session)
      .then(() => acl.isSessionUser(session, user_id))
      .then(() => acl.canModifyCourse(session.user, course_id))
      .then(() => db.Courses.setCourseRole(course_id, user_id, role))
      .then(
         result => res.json({ response: result })
      )
      .catch(err => 
         res.json({ response: err })
      );
});

router.get('/user/login', (req, res) => {
   res.json({ response: req.session.user });
});

router.post('/user/login', (req, res) => {
   db.Users.authenticate(req.body.email, req.body.password, (result, err) => {
      if (err === null) {
         delete result.password;
         req.session.user = result;
         res.json({ response: result });
      }
      else {
         res.json({ response: err });
      }
   });
});

router.get('/user/logout', (req, res) => {
   req.session.user = null;
   res.json({ response: req.session.user });
});

router.post('/user/create', (req, res) => {
   const user = { first_name: req.body.first_name, last_name: req.body.last_name, email: req.body.email, password: req.body.password };
   if (user.first_name !== undefined && user.first_name.length > 0) {
      if (user.last_name !== undefined && user.last_name.length > 0) {
         if (user.email !== undefined && user.email.length > 0) {
            if (user.password !== undefined && user.password.length > 0) {
               db.Users.create(user, (result, err) => {
                  if (err === null) {
                     user.id = result;
                     delete user.password;
                     res.json({ response: user });
                  }
                  else {
                     res.json({ response: err });
                  }
               });
               return;
            }
         }
      }
   }
   res.json({ response: "missing required parameters" });
});

/**
 * Allows bulk user creation.  TODO: needs testing
 */
router.post('/user/addRoster', (req, res) => {
   let session = req.session;
   let roster = req.body.roster;
   let course_id = req.body.course_id;
   acl.canModifyCourse(session, course_id)
      .then(() => {
         for (let user of roster) {
            db.Users.exists(user.email)
               .then()
               .catch(() => {

                  //user doesn't already exist, create
                  db.Users.create(user.email, user.first_name, user.last_name, user.password);
               });
         }
      })
      .catch((err) => { res.json({ response: err }); });
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server running on port ' + port);
