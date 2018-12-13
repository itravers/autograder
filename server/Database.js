const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

class Database{

   constructor(connection_string, hash_salt, crypto_method){
      this.connection_string = connection_string;
      this.hash_salt = hash_salt;
      this.crypto_method = crypto_method;
      this.db = new sqlite3.Database(connection_string, sqlite3.OPEN_READWRITE, (err) => {
         if (err) {
            console.error(err.message);
         }
      });
   }

   createUser(email, first_name, last_name, password, callback){
      const sql = "INSERT INTO users " +
                  " (email, first_name, last_name, password) " + 
                  " VALUES ($email, $first_name, $last_name, $password)";
      
      //hash password
      let hasher = crypto.createHash(this.crypto_method);
      password += this.hash_salt + email;
      hasher.update(password);
      password = hasher.digest('hex');
      
      const params = {$email: email, $first_name: first_name, $last_name: last_name, $password: password};
      this.db.run(sql, params, (err) =>{
         if (err === null) {
            callback(this.lastID);
         }
         else{
            console.log(err);
            callback(err);
         }
      });
   }

}