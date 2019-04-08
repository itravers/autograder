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
const Compiler = require('./Compiler.js');
var FileStore = require('session-file-store')(session);


let config = ini.parse(fs.readFileSync('./config.ini', 'utf-8'));
config.database.connection_string = config.database.db_path + config.database.db_name;

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

//compiles & runs code
router.post('/compile', (req, res) => {
   let session = req.session;
   const tools_command = config.compiler.tools_path + "\\" + config.compiler.tools_batch;
   const compile_cmd = config.compiler.compile_command;
   const stdin = req.body.stdin;
   const files = req.body.files;
   const assignment_id = Number(req.body.assignment_id);
   const student_id = Number(req.body.student_id);

   if (assignment_id < 1 || student_id < 1) {

   }

   let compiler = Compiler.createCompiler(
      files,
      config.temp_path,
      assignment_id,
      student_id,
      tools_command,
      compile_cmd,
      stdin
   );
   compiler.begin()
      .then((result) => {
         res.json({ response: result });
      })
      .catch((err) => {
         res.json({ response: err.message });
      });
});


// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server running on port ' + port);

