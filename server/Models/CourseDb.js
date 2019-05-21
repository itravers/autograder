const sqlite3 = require('sqlite3').verbose();

class CoursesDb {

   constructor(db_connection) {
      this.db = db_connection;

      this.addCourse = this.addCourse.bind(this);
      this.addUser = this.addUser.bind(this); 
      this.all = this.all.bind(this);
      this.assignments = this.assignments.bind(this);
      this.forUser = this.forUser.bind(this);
      this.canGrade = this.canGrade.bind(this);
      this.canModify = this.canModify.bind(this);
   }

   addCourse(school_id, name, term, year) {
      const sql = "INSERT INTO courses(school_id, name, term, year) VALUES($school_id, $name, $term, $year)";
      const params = { $school_id: school_id, $name: name, $term: term, $year: year }

      return new Promise((resolve, reject) => {

         //AC: placing db callback function into its own variable changes 
         //*this* from local object to result of sqlite3 db call.
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

   addUser(course_id, user_id) {
      const sql = "INSERT INTO course_users (course_id, user_id) VALUES($course_id, $user_id)";
      const params = { $course_id: course_id, $user_id: user_id }

      return new Promise((resolve, reject) => {

         //AC: placing db callback function into its own variable changes 
         //*this* from local object to result of sqlite3 db call.
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

   assignments(course_id, include_active = true, include_deleted = true,  callback) {
      let sql = "SELECT * FROM assignments WHERE course_id = $course_id";
      if(include_active === true && include_deleted === false)
      {
         sql += "AND is_deleted = 0"; 
      }
      else if(include_active === false && include_deleted === true)
      {
         sql += "AND is_deleted = 1"; 
      }
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

   canGrade(course_id, user_id) {
      return new Promise((resolve, reject) => {
         const sql = "SELECT * FROM course_users "
            + "WHERE course_id = $course_id AND user_id = $user_id AND course_role & 8 > 0";
         const params = { $course_id: course_id, $user_id: user_id }
         this.db.get(sql, params, (err, row) => {
            if (err === null && row !== undefined) {
               resolve(true);
            }
            else if (err !== null) {
               console.log(err);
               reject(err);
            }
            else
            {
               reject(false);
            }
         });
      });
   }

   canModify(course_id, user_id) {
      return new Promise((resolve, reject) => {
         const sql = "SELECT * FROM course_users "
            + "WHERE course_id = $course_id AND user_id = $user_id AND course_role & 4 > 0";
         const params = { $course_id: course_id, $user_id: user_id }
         this.db.get(sql, params, (err, row) => {
            if (err === null && row !== undefined) {
               resolve(true);
            }
            else if (err !== null) {
               console.log(err);
               reject(err);
            }
            else
            {
               reject(false);
            }
         });
      });
   }

   courseUsers(course_id) {
      return new Promise((resolve, reject) => {
         let sql = "SELECT u.first_name, u.last_name, u.email, cu.* "
            + " FROM course_users cu "
            + " INNER JOIN users u ON cu.user_id = u.id "
            + " WHERE course_id = $course_id "
            + " ORDER BY u.last_name, u.first_name";
         this.db.all(sql, { $course_id: course_id }, (err, rows) => {
            if (err === null && rows !== undefined) {
               resolve(rows);
            }
            else if (err !== null) {
               console.log(err);
               reject(err);
            }
            else{
               reject(false);
            }
         });
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
         //*this* from local object to result of sqlite3 db call.
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

   setCourseRole(course_id, user_id, role){
      const sql = "UPDATE course_users SET course_role = $role WHERE course_id = $course_id AND user_id = $user_id";
      const params = { $course_id: course_id, $user_id: user_id, $role: role }

      return new Promise((resolve, reject) => {

         //AC: placing db callback function into its own variable changes 
         //*this* from local class object to result of sqlite3 db call.
         var local_callback = function (err) {
            if (err === null) {
               resolve(this.changes);
               return;
            }
            else {
               console.log(err);
               reject(err);
               return;
            }
         };
         this.db.run(sql, params, local_callback);
      });
   }
}

exports.createCoursesDb = function (db_connection) {
   return new CoursesDb(db_connection);
}