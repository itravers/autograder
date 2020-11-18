const sqlite3 = require('sqlite3').verbose();

class AssignmentFilesDb {

   /**
    * AssignmentFilesDb constructor.
    * @param {*} db_connection The database connection. 
    */
   constructor(db_connection) {
      this.db = db_connection;

      this.add = this.add.bind(this);
      this.all = this.all.bind(this);
      this.get = this.get.bind(this);
      this.remove = this.remove.bind(this);
      this.removePrior = this.removePrior.bind(this);
      this.submitAssignment = this.submitAssignment.bind(this);
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
         this.removePrior(user_id, assignment_id, file_name)
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
    * Marks assignment as submitted if it is not locked
    * @param {Number} assignment_id The assignment's ID number (integer).
    * @param {Number} user_id The specified user's ID number (integer). 
    * @returns {Promise} Resolves with change of is_submitted value if successful; 
    *    rejects if there is an error. 
    */
   submitAssignment(assignment_id, user_id) {
      const sql = "UPDATE assignment_files SET is_submitted = 1 WHERE assignment_id = $assignment_id AND owner_id = $user_id AND is_deleted = 0 AND assignment_id IN (SELECT a.id FROM assignments a WHERE a.is_locked = 0)";
      return new Promise((resolve, reject) => {
         var local_callback = function(err) {
            if (err === null)
            {
               resolve(this.changes);
               return;
            }
            else{
               console.log(err);
               reject(err);
               return;
            }
         };
         this.db.run(sql,{$assignment_id: assignment_id, $user_id: user_id}, local_callback );
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
      const sql = "UPDATE assignment_files set is_deleted = 1, date_deleted = datetime('now') WHERE id = $id ";
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
    * Removes (soft deletes) prior versions of a given file for a given user and assignment.
    * @param {Number} owner_id The owner's user ID number (integer).
    * @param {Number} assignment_id The assignment's ID number (integer).
    * @param {String} file_name The file's name. 
    * @returns {Promise} Resolves with the number of files affected if successful; 
    *    rejects with error otherwise. 
    */
   removePrior(owner_id, assignment_id, file_name) {
      const sql = "UPDATE assignment_files set is_deleted = 1 WHERE owner_id = $owner_id AND assignment_id = $assignment_id AND file_name = $file_name ";
      const params = { $owner_id: owner_id, $assignment_id: assignment_id, $file_name: file_name };

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