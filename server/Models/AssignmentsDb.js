const sqlite3 = require('sqlite3').verbose();

class AssignmentsDb {

   /**
    * AssignmentsDb constructor.
    * @param {*} db_connection The database connection. 
    */
   constructor(db_connection) {
      this.db = db_connection;

      this.hasUser = this.hasUser.bind(this);
      this.assignmentInfo = this.assignmentInfo.bind(this);
      this.lockAssignment = this.lockAssignment.bind(this);
      this.isLocked = this.isLocked.bind(this); 
   }

   /**
    * Determines whether or not the supplied user is attached to the supplied assignment.
    * @param {Number} assignment_id The assignment's ID number (integer). 
    * @param {Number} user_id The supplied user's ID number (integer). 
    * @returns {Promise} Resolves with a row containing the assignment and course ID if
    *    the user is attached to this assignment; rejects otherwise. 
    */
   hasUser(assignment_id, user_id){
      const sql = "SELECT a.id, a.course_id FROM assignments a " +
                  " INNER JOIN course_users cu ON a.course_id = cu.course_id " +
                  " WHERE user_id = $user_id AND a.id = $assignment_id " +
                  " LIMIT 1";
      const params = {$user_id: user_id, $assignment_id: assignment_id};
      return new Promise((resolve, reject) => {
         this.db.get(sql, params, (err, row) => {
            if(err === null && row !== undefined) {
               resolve(row); 
            }
            else {
               reject(err); 
            }
         });
      });
   }

   /**
    * Returns the row in the assignments table corresponding to the given 
    * assignment. 
    * @param {Number} assignment_id The assignment's ID number (integer). 
    * @returns {Promise} Resolves with a row containing the assignment's
    *    information if this assignment exists; rejects otherwise. 
    */
   assignmentInfo(assignment_id)
   {
      const sql = "SELECT * FROM assignments WHERE id = $assignment_id"; 
      const params = {$assignment_id: assignment_id}; 
      return new Promise((resolve, reject) => {
         this.db.get(sql, params, (err, row) => {
            if(err === null && row !== undefined) {
               resolve(row); 
            }
            else {
               reject(err); 
            }
         });
      });
   }

    /**
    * Toggles assignment's lock status
    * @param {Number} assignment_id The assignment's ID number (integer).
    * @returns {Promise} Resolves with change of is_locked value if successful; 
    *    rejects if there is an error. 
    */
   lockAssignment(assignment_id) {
      const sql = "UPDATE assignments SET is_locked = NOT is_locked WHERE id = $assignment_id";
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
         this.db.run(sql,{$assignment_id: assignment_id}, local_callback );
      });
   }

/**
    * Checks assignment's locked status
    * @param {Number} assignment_id The assignment's ID number (integer).
    * @returns {Promise} Resolves with result of is_locked value if successful; 
    *    rejects if there is an error. 
    */
   isLocked(assignment_id) {
      const sql = "SELECT is_locked FROM assignments WHERE id = $assignment_id";
      const params = { $assignment_id: assignment_id };
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
}

/**
 * Contains methods to query assignment information in the database.
 * @typedef {Object} AssignmentsDb
 */

/**
 * Creates a new AssignmentsDb.
 * @param {Object} db_connection Database connection.
 * @returns {AssignmentsDb} Instance of AssignmentsDb.
 */
exports.createAssignmentsDb = function (db_connection) {
   return new AssignmentsDb(db_connection);
}