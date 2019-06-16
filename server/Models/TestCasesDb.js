const sqlite3 = require('sqlite3').verbose();

class TestCasesDb {

   constructor(db_connection) {
      this.db = db_connection;

      this.forAssignment = this.forAssignment.bind(this);
      this.log = this.log.bind(this);
      this.testResults = this.testResults.bind(this); 
   }

   /**
    * Returns all tests cases associated with a particular assignment
    * @param {int} assignment_id 
    */
   forAssignment(assignment_id) {
      const sql = "SELECT * FROM assignment_tests WHERE assignment_id = $aid";
      const params = { $aid: assignment_id };
      return new Promise((resolve, reject) => {
         this.db.all(sql, params, (err, rows) => {
            if (err === null && rows !== undefined) {
               resolve(rows);
            }
            else {
               console.log(err);
               reject(err); 
            }
         });
      });
   }

   /**
    * Records test results in the database. 
    * @param {*} assignment_id 
    * @param {*} user_id 
    * @param {*} test_name 
    * @param {*} test_input 
    * @param {*} test_result 
    */
   log(assignment_id, user_id, test_name, test_input, test_result) {

      const sql = "INSERT INTO test_results " +
         " (assignment_id, user_id, test_name, test_input, test_result) " +
         " VALUES ($assignment_id, $user_id, $test_name, $test_input, $test_result)";
      const params = {
         $user_id: user_id,
         $assignment_id: assignment_id,
         $test_name: test_name,
         $test_input: test_input,
         $test_result: test_result
      };
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

   /**
    * Returns test results for a given user's assignment. 
    * @param {*} assignment_id 
    * @param {*} user_id 
    */
   testResults(assignment_id, user_id) {
      return new Promise((resolve, reject) => {
         const sql = "SELECT * FROM test_results WHERE assignment_id = $assignment_id AND user_id = $user_id ORDER BY date_run DESC, test_name";
         const params = { $assignment_id: assignment_id, $user_id: user_id };
         this.db.all(sql, params, (err, rows) => {
            if (err === null && rows !== undefined) {
               resolve(rows);
            }
            else {
               console.log(err);
               reject(err);
            }
         });
      });
   }
}

exports.createTestCasesDb = function (db_connection) {
   return new TestCasesDb(db_connection);
}