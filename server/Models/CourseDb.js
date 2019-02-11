const sqlite3 = require('sqlite3').verbose();

class CoursesDb {

   constructor(db_connection) {
      this.db = db_connection;

      this.all = this.all.bind(this);
      this.assignments = this.assignments.bind(this);
      this.forUser = this.forUser.bind(this);
   }

   all(callback, include_deleted=false) {
      let sql = "SELECT * FROM courses";
      if(include_deleted === false){
         sql += " WHERE is_deleted = 0";
      } 
      sql += " ORDER BY year DESC";
      this.db.all(sql, {}, (err, rows) => {
         if (err === null && rows !== undefined) {
            callback(rows);
            return;
         }
         else if (err !== null) {
            console.log(err);
         }
         callback({});
      });
   }

   assignments(course_id, callback) {
      const sql = "SELECT * FROM assignments WHERE course_id = $course_id";
      this.db.all(sql, { $course_id: course_id }, (err, rows) => {
         if (err === null && rows !== undefined) {
            callback(rows);
            return;
         }
         else if (err !== null) {
            console.log(err);
         }
         callback({});
      });
   }

   forUser(user_id, callback) {
      const sql = "SELECT * FROM courses c " +
         " INNER JOIN course_users cu ON c.id = cu.course_id " +
         " WHERE cu.user_id = $user_id";
      this.db.all(sql, { $user_id: user_id }, (err, rows) => {
         if (err === null && rows !== undefined) {
            callback(rows);
            return;
         }
         else if (err !== null) {
            console.log(err);
         }
         callback({});
      });
   }

   //ensures that the combination of school, name, term, and year are all unique
   isUnique(school_id, name, term, year) {
      return new Promise((resolve, reject) => {
         const sql = "SELECT * FROM courses "
            + "WHERE school_id = $id " 
            + "AND name = $name " 
            + " AND term = $term " 
            + "AND year = $year "
            + "AND is_deleted=0 ";
         this.db.get(sql, {$id: school_id, $name: name, $term: term, $year: year}, (err, row) => {
            if (err === null && row !== undefined) {
               reject(false);
               return;
            }
            else if (err !== null) {
               console.log(err);
            }
            resolve(true);
         });
      });
   }
}

exports.createCoursesDb = function (db_connection) {
   return new CoursesDb(db_connection);
}