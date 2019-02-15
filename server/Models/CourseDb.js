const sqlite3 = require('sqlite3').verbose();

class CoursesDb {

   constructor(db_connection) {
      this.db = db_connection;

      this.all = this.all.bind(this);
      this.assignments = this.assignments.bind(this);
      this.forUser = this.forUser.bind(this);
   }

   addUser(course_id, user_id) {
      const sql = "INSERT INTO course_users (course_id, user_id) VALUES($course_id, $user_id)";
      const params = { $course_id: course_id, $user_id: user_id }

      return new Promise((resolve, reject) => {
         
         //AC: placing db callback function into its own variable changes 
         //*this* from local AssignmentFilesDb object to result of sqlite3 db call.
         var local_callback = function (err) {
            if (err === null) {
               resolve(this.lastID);
            }
            else {
               console.log(err);
               reject(err);
            }
         };
         this.db.run(sql, params, local_callback);
      });
   }

   all(callback, include_deleted = false) {
      let sql = "SELECT c.*, s.name AS school_name, s.acronym  FROM courses c INNER JOIN schools s ON c.school_id = s.id";
      if (include_deleted === false) {
         sql += " WHERE is_deleted = 0 AND is_active = 1";
      }
      sql += " ORDER BY c.year, c.term DESC";
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
         this.db.get(sql, { $id: school_id, $name: name, $term: term, $year: year }, (err, row) => {
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

   removeUser(course_id, user_id) {
      const sql = "DELETE FROM course_users WHERE course_id = $course_id AND user_id = $user_id";
      const params = { $course_id: course_id, $user_id: user_id }

      return new Promise((resolve, reject) => {
         
         //AC: placing db callback function into its own variable changes 
         //*this* from local AssignmentFilesDb object to result of sqlite3 db call.
         var local_callback = function (err) {
            if (err === null) {
               resolve(this.changes);
            }
            else {
               console.log(err);
               reject(err);
            }
         };
         this.db.run(sql, params, local_callback);
      });
   }
}

exports.createCoursesDb = function (db_connection) {
   return new CoursesDb(db_connection);
}