const database = require('../Models/Database.js');
const fs = require('fs');
const ini = require('ini');

class DbSeed{

   constructor(db){
      this.db = db;
   }

   setupUsers(){
      const dummy_users = [
         {
            email: "bob@admin.com",
            first_name: "Bob",
            last_name: "Smith",
            password: "password",
            is_admin: true
         },
         {
            email: "sam@student.com",
            first_name: "Sam",
            last_name: "Stevens",
            password: "password",
            is_admin: false
         }
      ];
      for(const user of dummy_users){
         this.db.createUser(user.email, user.first_name, user.last_name, user.password, user.is_admin);
      }
   }
}

/*
let config = ini.parse(fs.readFileSync('../config.ini', 'utf-8'));
var connection_string = "../" + config.database.db_path + config.database.db_name;
let db = database.CreateDatabase(connection_string, config.database.secret_hash, config.database.crypto_method);
let seeder = new DbSeed(db);
seeder.setupUsers();
*/