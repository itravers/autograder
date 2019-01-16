const sqlite3 = require('sqlite3').verbose();

class AssignmentFilesDb {

   constructor(db_connection) {
      this.db = db_connection;

      this.add = this.add.bind(this);
      this.all = this.all.bind(this);
      this.get = this.get.bind(this);
      this.remove = this.remove.bind(this);
      this.removePrior = this.removePrior.bind(this);
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
            " VALUES ($assignment_id, $user_id, $file_name, $contents)";
         const params = { 
            $user_id: user_id, 
            $assignment_id: assignment_id, 
            $file_name: file_name, 
            $contents: contents 
         };

         //AC: placing db callback function into its own variable changes 
         //*this* from local AssignmentFilesDb object to result of sqlite3 db call.
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
    * Returns all assignments for the specified user
    * @param {*} assignment_id 
    * @param {*} user_id 
    */
   all(assignment_id, user_id, callback){
      const sql = "SELECT * FROM assignment_files WHERE assignment_id = $assignment_id AND owner_id = $user_id AND is_deleted = 0";
      this.db.all(sql, {$assignment_id: assignment_id, $user_id: user_id}, (err, rows) =>{
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

   /**
    * Returns a single file based on its unique ID
    * @param {*} file_id 
    * @param {*} callback 
    */
   get(file_id, callback){
      const sql = "SELECT * FROM assignment_files WHERE id = $file_id";
      const params = { $file_id: file_id };
      this.db.get(sql, params, (err, row) => {
         if (typeof (callback) !== "function") {
            callback = function (x, y) { };
         }
         if (err === null && row !== undefined) {
            callback(row, null);
         }
         else {
            callback(null, err);
         }
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