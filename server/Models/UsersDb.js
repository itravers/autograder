const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

class UsersDb {

   constructor(db_connection, crypto_method) {
      this.db = db_connection;
      this.crypto_method = crypto_method;

      this.authenticate = this.authenticate.bind(this);
      this.create = this.create.bind(this);
      this.exists = this.exists.bind(this);
      this.hash_password = this.hash_password.bind(this);
   }


   /**
    * Attempts to authenticate the supplied email / password combo.  
    * Returns user if valid, -1 otherwise.
    * @param {*} email 
    * @param {*} password 
    */
   authenticate(email, password) {
      const sql = "SELECT * FROM users WHERE email = $email AND password = $password LIMIT 1";
      password = this.hash_password(password, email);
      const params = { $email: email, $password: password };
      return new Promise((resolve, reject) => {
         this.db.get(sql, params, (err, row) => {
            if (err === null && row !== undefined) {
               resolve(row);
            }
            else {
               reject(err); 
            }
         });
      });
   }

   /**
    * Creates a new user
    * @param {object} user
    * @param {function} callback 
    */
   create(user, callback) {
      const sql = "INSERT INTO users " +
         " (email, first_name, last_name, password) " +
         " VALUES ($email, $first_name, $last_name, $password)";

      //hash password
      const password = this.hash_password(user.password, user.email);

      //add base options
      const params = { $email: user.email, $first_name: user.first_name, $last_name: user.last_name, $password: password };

      //AC: placing db callback function into its own variable changes 
      //*this* from local AssignmentFilesDb object to result of sqlite3 db call.
      var local_callback = function (err) {
         if (typeof (callback) !== "function") {
            callback = function (x, y) { };
         }
         if (err === null) {
            callback(this.lastID, null);
         }
         else {
            console.log(err);
            callback(null, err);
         }
      };
      this.db.run(sql, params, local_callback);
   }

   /**
    * Returns true if the user exists in the system
    * @param {} user_name 
    */
   exists(user_name){
      const sql = "SELECT * FROM users WHERE email = $email LIMIT 1";
      const params = { $email: user_name};
      return new Promise((resolve, reject) => {
         this.db.get(sql, params, (err, row) => {
            if (err === null && row !== undefined) {
               resolve(true);
            }
            else {
               reject(false);
            }
         });
      });
   }

   /** 
    * Selects information from users table for requested user 
    * @param {*} email
    * @param {function} callback
    */
   userRow(email) {
      const sql = "SELECT * FROM users WHERE email = $email LIMIT 1"; 
      const params = {$email: email};
      return new Promise((resolve, reject) => {
         this.db.get(sql, params, (err, row) => {
            if(err === null && row !== undefined) {
               resolve(row); 
            }
            else {
               reject(err); 
            }
         });
      });
   }

   /**
    * Hashes the supplied password.  By convention, salt should be the user's email.
    * @param {*} password 
    * @param {*} salt 
    */
   hash_password(password, salt) {
      let hasher = crypto.createHash(this.crypto_method);
      password += this.hash_salt + salt;
      hasher.update(password);
      password = hasher.digest('hex');
      return password;
   }
}

exports.createUsersDb = function (db_connection, crypto_method) {
   return new UsersDb(db_connection, crypto_method);
}