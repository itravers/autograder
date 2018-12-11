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
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const fileUpload = require('express-fileupload');

const config = require('./config.js');
const FilePondManager = require('./FilePondManager.js');

var server_config = config.ServerConstants();
var file_pond_manager = FilePondManager.FilePondManager(server_config.temp_folder, server_config.uploads_folder);

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());

var port = process.env.PORT || 8080;        // set our port

//Allow CORS from react (not safe for production)
if(server_config.mode === "debug"){
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
router.get('/', function (req, res) {
   res.json({ message: 'hooray! welcome to our api!' });
});

router.post('/uploadCode', function (req, res) {
   file_pond_manager.uploadTemp(req.files.filepond, (result, err) =>{
      if(err !== null){
         return res.status(500).send(err);
      }
      else{
         res.json({ result });
      }
   });
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Server running on port ' + port);

