const sqlite3 = require('sqlite3').verbose();

class AssignmentFilesDb {

   /**
    * AssignmentFilesDb constructor.
    * @class
    * @param {*} db_connection The database connection. 
    */
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
    * @param {Number} user_id The user's ID number (integer). 
    * @param {Number} assignment_id The assignment's ID number (integer). 
    * @param {String} file_name The new file's name. 
    * @param {String} contents The new file's contents. 
    * @returns {Promise} Resolves with new file's ID number if successful; rejects with 
    *    error otherwise. 
    */
   add(user_id, assignment_id, file_name, contents) {
      return new Promise((resolve, reject) => {

         //remove any prior version of this file before adding new version
         this.removePrior(assignment_id, file_name)
         .then(() => {
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
         })
         .catch(err => {
            reject(err); 
         }); 
      });
   }

   /**
    * Returns all assignments for the specified user.
    * @param {Number} assignment_id The assignment's ID number (integer).
    * @param {Number} user_id The specified user's ID number (integer). 
    * @returns {Promise} Resolves with all assignments for the user if successful; 
    *    rejects if there is an error or user has no assignments. 
    */
   all(assignment_id, user_id){
      return new Promise((resolve, reject) => {
         const sql = "SELECT * FROM assignment_files WHERE assignment_id = $assignment_id AND owner_id = $user_id AND is_deleted = 0";
         this.db.all(sql, {$assignment_id: assignment_id, $user_id: user_id}, (err, rows) => {
            if (err === null && rows !== undefined) {
               resolve(rows);
            }
            else if (err !== null) {
               console.log(err);
               reject(err); 
            }
            else {
               reject(); 
            }
         });
      });
   }

   /**
    * Returns a single file based on its unique ID.
    * @param {Number} file_id The file's ID number (integer). 
    * @returns {Promise} Resolves with the file if successful; rejects with 
    *    error if the file does not exist or other error occurs. 
    */
   get(file_id){
      const sql = "SELECT * FROM assignment_files WHERE id = $file_id";
      const params = { $file_id: file_id };
      return new Promise((resolve, reject) => {
         this.db.get(sql, params, (err, row) => {
            if (err === null && row !== undefined) {
               resolve(row);
            }
            else {
               reject(err);
            }
         });
     });
   }

   /**
    * Soft-deletes a file from the database.
    * @param {Number} id The file's ID number (integer).
    * @returns {Promise} Resolves with the number of rows affected if successful;
    *    rejects with error otherwise. 
    */
   remove(id) {
      const sql = "UPDATE assignment_files set is_deleted = 1 WHERE id = $id ";
      const params = { $id: id };
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

   /**
    * Removes (soft deletes) of prior versions of a given file for a given assignment.
    * @param {Number} assignment_id The assignment's ID number (integer).
    * @param {String} file_name The file's name. 
    * @returns {Promise} Resolves with the number of files affected if successful; 
    *    rejects with error otherwise. 
    */
   removePrior(assignment_id, file_name) {
      const sql = "UPDATE assignment_files set is_deleted = 1 WHERE assignment_id = $assignment_id AND file_name = $file_name ";
      const params = { $assignment_id: assignment_id, $file_name: file_name };

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
}

/**
 * Contains methods to alter records of files belonging to assignments
 * in the database. 
 * @typedef {Object} AssignmentFilesDb
 */

/**
 * Creates a new AssignmentFilesDb.
 * @param {Object} db_connection Database connection.
 * @returns {AssignmentFilesDb} Instance of AssignmentFilesDb.
 */
exports.createAssignmentFilesDb = function (db_connection) {
   return new AssignmentFilesDb(db_connection);
}