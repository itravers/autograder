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
var Compiler = require('./Models/Windows_Metal_MSVC_Compiler.js');

var FileStore = require('session-file-store')(session);

// require modules for API routes 
const userRoute = require('./Routes/user.js'); 
const assignmentRoute = require('./Routes/assignment.js'); 
const courseRoute = require('./Routes/course.js'); 

let config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
config.database.connection_string = config.database.db_path + config.database.db_name;;
let file_manager = FileManager.FileManager(config.temp_path, config.uploads_path);
let db = Database.createDatabase(config.database.connection_string, config.database.secret_hash, config.database.crypto_method);
let acl = AccessControlList.createACL(db);

//let mail_config = ini.parse(fs.readFileSync('./config.mail.ini', 'utf-8'));
//let mail_api_key = mail_config.api_key;

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
   store: new FileStore({ path: config.session_path, ttl: 86400 }),
   secret: config.database.secret_hash,
   resave: false,
   saveUninitialized: false,
   cookie: cookie
}));

var port = process.env.PORT || 8080;        // set our port

if (config.mode === "debug") {
   console.log("running in debug mode.");
}

if (config.compile_platform === "unix") {
   Compiler = require('./Models/Mac_Metal_Clang_Compiler.js');
}
else if (config.compile_platform === "windows") {
   Compiler = require('./Models/Windows_Metal_MSVC_Compiler.js');
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

// get test cases for the given assignment 
router.get('/assignment/testCases/:assignment_id', (req, res) => assignmentRoute.getTestCases(req, res, db)); 

// gets user's test results for this assignment, if the user has permission
// to view them 
router.get('/assignment/testResults/:assignment_id/:user_id', (req, res) => assignmentRoute.getTestResults(req, res, db, acl)); 

//runs student's code without compiling first (saves time)
router.post('/assignment/run/:assignment_id', (req, res) => assignmentRoute.run(req, res, db, config, acl)); 

//compiles & runs student's code
router.post('/assignment/compile/:assignment_id', (req, res) => assignmentRoute.compileAndRun(req, res, db, config, acl)); 

// Retrieves all files for the specified assignment and user (if allowed to grade)
router.get('/assignment/file/:aid/:uid', (req, res) => assignmentRoute.assignmentFiles(req, res, db, acl)); 

// Uploads a file. :id is the assignment ID that this file will belong to.
router.post('/assignment/file/:id', (req, res) => assignmentRoute.uploadFile(req, res, db, acl)); 

/**
 * :id is the assignment ID that this file will belong to.   The file ID to delete 
 * should be in req.body.id.
 */
router.delete('/assignment/file/:id', (req, res) => assignmentRoute.deleteFile(req, res, db, acl)); 

//Returns all available courses
router.get('/course', (req, res) => courseRoute.courses(req, res, db)); 

// Creates a course. 
router.post('/course', (req, res) => courseRoute.createCourse(req, res, db, acl)); 

// returns all assignments from the given course 
router.get('/course/assignments/:id', (req, res) => courseRoute.assignments(req, res, db)); 

// returns all active assignments from the given course 
router.get('/course/assignments/active/:id', (req, res) => courseRoute.activeAssignments(req, res, db));

// returns all inactive assignments from the given course 
router.get('/course/assignments/inactive/:id', (req, res) => courseRoute.inactiveAssignments(req, res, db)); 

// Returns all courses that the currently logged in user is taking
router.get('/course/user', (req, res) => courseRoute.enrollments(req, res, db));

/**
 * Returns a detailed roster for this course if the user has 
 * instructor rights
 */
router.get('/course/user/:course_id', (req, res) => courseRoute.roster(req, res, db, acl)); 

// Removes the user specified in req.body from the selected course
// TODO: revise so that students can't remove/add each other from 
// courses-- only instructors should be able to do that, right?
router.delete('/course/user/:course_id', (req, res) => courseRoute.removeUser(req, res, db, acl)); 

// Adds the user to the specified course
router.post('/course/user/:course_id', (req, res) => courseRoute.addUser(req, res, db, acl)); 

// Alters user's course role
router.put('/course/user/:course_id', (req, res) => courseRoute.editRole(req, res, db, acl)); 

// returns information on currently logged in user
router.get('/user/login', (req, res) => userRoute.info(req, res)); 

// logs in a user with given credentials 
router.post('/user/login', (req, res) => userRoute.login(req, res, db)); 

// logs out user 
router.get('/user/logout', (req, res) => userRoute.logout(req, res)); 

// creates new user
router.post('/user/create', (req, res) => userRoute.createUser(req, res, db)); 

// Allows bulk user creation.  TODO: needs testing
router.post('/user/addRoster', (req, res) => userRoute.addRoster(req, res, db, acl)); 

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server running on port ' + port);

