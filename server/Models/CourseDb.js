const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

class CoursesDb {

   constructor(db_connection) {
      this.db = db_connection;
   }

   assignments(course_id, callback) {
      const sql = "SELECT * FROM assignments WHERE course_id = $course_id";
      let result = this.db.all(sql, {$course_id: course_id}, (err, rows) =>{
         if (err === null && rows !== undefined) {
            callback(rows);
            return;
         }
         else if(err !== null){
            console.log(err);
         }
         callback({});
      });
   }

   forUser(user_id, callback) {
      const sql = "SELECT * FROM courses c " +
         " INNER JOIN course_users cu ON c.id = cu.course_id " +
         " WHERE cu.user_id = $user_id";
      let result = this.db.all(sql, {$user_id: user_id}, (err, rows) =>{
         if (err === null && rows !== undefined) {
            callback(rows);
            return;
         }
         else if(err !== null){
            console.log(err);
         }
         callback({});
      });
   }
}

exports.createCoursesDb = function (db_connection) {
   return new CoursesDb(db_connection);
}