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
            login: "bob@admin.com",
            name: "Bob Smith",
            password: "password",
            is_admin: true
         },
         {
            login: "sam@student.com",
            name: "Sam Stevens",
            password: "password",
            is_admin: false
         }
      ];
      for(const user of dummy_users){
         this.db.createUser(user.login, user.name, user.password);
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