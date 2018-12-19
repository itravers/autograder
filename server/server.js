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


let config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
config.database.connection_string = config.database.db_path + config.database.db_name;;
let file_manager = FileManager.FileManager(config.temp_path, config.uploads_path);
let db = Database.createDatabase(config.database.connection_string, config.database.secret_hash, config.database.crypto_method);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

let cookie = { secure: false, httpOnly: false, maxAge: 60000 };
app.use(session({
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

/**
 * Uploads a file.  :id is the assignment ID that this file will belong to.
 */
router.post('/assignment/file/:id', (req, res) => {
   const current_user = req.session.user;
   const assignment_id = req.params.id;
   const uploaded_file = req.files.filepond;

   //make sure user can upload to this assignment
   if (current_user !== undefined) {
      db.Assignments.has_user(assignment_id, current_user.id, (result, err) => {
         if (result === true) {
            let buffer_data = Buffer.from(uploaded_file.data);
            const text = buffer_data.toString('utf8');
            db.AssignmentFiles.add(current_user.id, assignment_id, uploaded_file.name, text, (result, err)=>{
               if(result !== null){
                  res.json({ result });
               }
               else{
                  return res.status(500).send(err);
               }
            });
         }
         else{
            return res.status(500).send("Invalid user");
         }
      });
   }
   else{
      return res.status(500).send("No user");
   }
});

router.delete('/assignment/file/:id', (req, res) => {
   //AC: I'm not getting FilePond's ID request on delete.  Will need to fix.
   const id = req.params.id;
   res.json({ response: "Not Implemented" });
});

router.get('/course/assignments/active/:id', (req, res) => {
   const course_id = req.params.id;
   db.Courses.assignments(course_id, (result) => {
      res.json({ response: result });
   });
});


router.get('/course/forUser/:id', (req, res) => {
   const user_id = req.params.id;
   const current_user = req.session.user;
   if (current_user !== undefined) {
      if (current_user.id === user_id || current_user.is_admin === 1) {
         db.Courses.forUser(user_id, (result) => {
            res.json({ response: result });
         });
      }
      else {
         console.log("User: " + current_user.id + " tried to access " + user_id);
         res.json({ response: {} });
      }
   }
   else {
      res.json({ response: {} });
   }

});

router.get('/user/login', (req, res) => {
   res.json({ response: req.session.user });
});

router.post('/user/login', (req, res) => {
   db.Users.authenticate(req.body.email, req.body.password, (result, err) => {
      if (err === null) {
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

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server running on port ' + port);

