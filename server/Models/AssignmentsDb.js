const sqlite3 = require('sqlite3').verbose();

class AssignmentsDb {

   /**
    * AssignmentsDb constructor.
    * @class
    * @param {*} db_connection The database connection. 
    */
   constructor(db_connection) {
      this.db = db_connection;

      this.hasUser = this.hasUser.bind(this);
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