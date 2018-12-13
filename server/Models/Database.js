const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');
const UserDb = require('./UserDb.js');

class Database{

   constructor(connection_string, hash_salt = "change this", crypto_method = "sha512"){
      this.connection_string = connection_string;
      this.hash_salt = hash_salt;
      this.crypto_method = crypto_method;
      this.db = new sqlite3.Database(connection_string, sqlite3.OPEN_READWRITE, (err) => {
         if (err) {
            console.error(err.message);
         }
      });

      this.Users = UserDb.createUserDb(this.db, this.crypto_method);
   }

   
}

exports.createDatabase = function(connection_string, hash_salt = "change this", crypto_method = "sha512"){
   return new Database(connection_string, hash_salt, crypto_method);
}