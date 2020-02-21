 const axios = require('axios'); 
 
 /**
  * Creates new user. 
  * @param {Object} req HTTP request object. 
  * @param {Object} res HTTP response object. 
  * @param {Object} db Database connection. 
  * @returns {Object} JSON response with the newly created user object, or with 
  *   an error message if unsuccessful.
  */
 exports.createUser = function(req, res, db) {
    const user = { name: req.body.name, login: req.body.login };
    if(user.login !== undefined && user.login.length > 0)
    {
      if(user.name == undefined || user.name.length == 0)
      {
         // if the github user has no name, set their "name" to 
         // their login 
         user.name = user.login; 
      }
       db.Users.create(user)
       .then(result => {
          user.id = result; 
          res.json({ response: user });
       })
       .catch(err => {
          res.json({ response: err });
       });
       return; 
    }
    res.json({ response: "missing required parameters" });
 }

/**
 * Returns information on currently logged-in user from Github.
 * @param {String} token Access token for GitHub.
 * @returns {Promise} Resolves with JSON object containing user data if someone 
 *    is logged in, rejects otherwise. 
 */
getGithubUser = function(token) {
   // Call the user info API using the fetch browser library 
   return new Promise((resolve, reject) => {
      axios({
         method: 'get', 
         url: 'https://api.github.com/user', 
         headers: {
            Authorization: 'token ' + token
         }
      })
      .then(response => {
         resolve(response.data); 
      })
      .catch(err => {
         reject(err); 
      })
   });
}

/** 
 * Returns information on currently logged in user.
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @returns {Object} JSON response containing information on logged-in user. 
 */
exports.info = function(req, res) {
    res.json({ response: req.session.user });
}
 
/** 
 * Logs out user.
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @returns {Object} JSON response. Should be null if logout was successful. 
 */
exports.logout = function(req, res) {
    req.session.user = null;
    res.json({ response: req.session.user });
}

/**
 * Authenticates user through GitHub and logs them into our app. 
 * @param {Object} req HTTP request object. 
 * @param {Object} res HTTP response object. 
 * @param {Object} db Database connection. 
 * @param {Object} OAuthConfig OAuth config information. 
 * @returns {Object} JSON response containing the logged-in user's information 
 *    if successful, or an error otherwise. 
 */
 exports.oauth = function(req, res, db, OAuthConfig) {
   const requestToken = req.query.code;

   // make a POST request to GitHub authentication API asking for access token
   axios({
     method: 'post',
     url: `https://github.com/login/oauth/access_token?client_id=${OAuthConfig.client_id}&client_secret=${OAuthConfig.client_secret}&code=${requestToken}`,
     headers: {
          accept: 'application/json'
     }
   })
   .then((response) => {
      // Fetch the info of the GitHub user who just authenticated
      // using the access token
     const accessToken = response.data.access_token;
      getGithubUser(accessToken)
      .then(user => validateUser(user, db))
      .then(user => {
         req.session.user = user; 
         res.redirect(`http://localhost:3000/account/login`);
      })
      .catch(err => {
         res.json({response: err});
      })
   })
   /*
   .catch(err => {
      res.json({response: err}); 
   })*/
}


/**
 * Checks if a GitHub user exists in the DB. If not, adds the user 
 * to the DB.  
 * @param {Object} user JSON object representing a GitHub user.
 * @param {Object} db Database connection. 
 * @returns {Promise} Resolves with user object if user either already existed 
 *    or was successfully created; rejects with error otherwise. 
 */
validateUser = function(user, db) {
   return new Promise((resolve, reject) => {
      // If the current Github user doesn't exist in the database, create user 
      db.Users.exists(user.login)
      .catch(() => {
         // User doesn't exist in DB, so create an entry for them 
         db.Users.create(user)
         .catch(() => {
            reject(false);
         });
      })
      .then(() => {
         resolve(user);
      })
   });
}