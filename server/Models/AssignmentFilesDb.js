const sqlite3 = require('sqlite3').verbose();

class AssignmentFilesDb {

   constructor(db_connection) {
      this.db = db_connection;
   }

   /**
    * Adds a new file for the supplied user / assignment combo.
    * @param {*} user_id 
    * @param {*} assignment_id 
    * @param {*} data 
    * @param {*} callback 
    */
   add(user_id, assignment_id, file_name, contents, callback) {
      
      //remove any prior version of this file before adding new version
      this.removePrior(assignment_id, file_name, (result) => {
         const sql = "INSERT INTO assignment_files " +
            " (assignment_id, owner_id, file_name, contents) " +
            " VALUES ($user_id, $assignment_id, $file_name, $contents)";
         const params = { 
            $user_id: user_id, 
            $assignment_id: assignment_id, 
            $file_name: file_name, 
            $contents: contents 
         };
         var local_callback = function(err){
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
      });
   }

   /**
    * Soft-deletes a file from the database
    * @param {*} id 
    * @param {*} callback 
    */
   remove(id, callback) {
      const sql = "UPDATE assignment_files set is_deleted = 1 WHERE id = $id ";
      const params = { $id: id };
      this.db.run(sql, params, (err) => {
         if (typeof (callback) !== "function") {
            callback = function (x, y) { };
         }
         if (err === null) {
            callback(this.changes, null);
         }
         else {
            console.log(err);
            callback(null, err);
         }
      });
   }

   /**
    * Removes (soft deletes) of prior versions of a given file for a given assignment
    * @param {*} assignment_id 
    * @param {*} file_name 
    * @param {*} callback 
    */
   removePrior(assignment_id, file_name, callback) {
      const sql = "UPDATE assignment_files set is_deleted = 1 WHERE assignment_id = $assignment_id AND file_name = $file_name ";
      const params = { $assignment_id: assignment_id, $file_name: file_name };
      this.db.run(sql, params, (err) => {
         if (typeof (callback) !== "function") {
            callback = function (x, y) { };
         }
         if (err === null) {
            callback(this.changes, null);
         }
         else {
            console.log(err);
            callback(null, err);
         }
      });
   }
}

exports.createAssignmentFilesDb = function (db_connection) {
   return new AssignmentFilesDb(db_connection);
}