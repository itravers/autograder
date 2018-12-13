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
let file_manager = FileManager.FileManager(config.temp_folder, config.uploads_folder);
let db = Database.createDatabase(config.database.connection_string, config.database.secret_hash, config.database.crypto_method);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use(session({ secret: config.database.secret_hash, resave: false, saveUninitialized: false, cookie: { maxAge: 60000}}))

var port = process.env.PORT || 8080;        // set our port

//Allow CORS from react (not safe for production)
if(config.mode === "debug"){
   console.log("running in debug mode.");
   app.use((req, res, next) => {
      const origin = req.get('origin');
   
      // Add origin validation
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', true);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
   
      // intercept OPTIONS method
      if (req.method === 'OPTIONS') {
         res.sendStatus(204);
      } else {
         next();
      }
   });
}

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', (req, res) => { 
   res.json({ message: 'hooray! welcome to our api!' });
});

router.post('/uploadCode', (req, res) => {
   file_manager.uploadTemp(req.files.filepond, (result, err) =>{
      if(err !== null){
         return res.status(500).send(err);
      }
      else{
         res.json({ result });
      }
   });
});

router.delete('/uploadCode', (req, res) => {
   //AC: I'm not getting FilePond's ID request on delete.  Will need to fix.
   res.json({response: "Not Implemented"});
});

router.get('/user/login', (req, res) =>{
   res.json({ response: req.session.user_id });
});

router.post('/user/login', (req, res) => {
   db.Users.authenticate(req.body.email, req.body.password, (result, err) => {
      if(err === null){
         req.session.user_id = result;
         res.json({ response: result });
      }
      else
      {
         res.json({ response: err });
      }
   });
});

router.get('/user/logout', (req, res) =>{
   req.session.user_id = null;
   res.json({ response: req.session.user_id });
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server running on port ' + port);

