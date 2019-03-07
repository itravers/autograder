const sqlite3 = require('sqlite3').verbose();

class TestCasesDb {

   constructor(db_connection) {
      this.db = db_connection;

      this.forAssignment = this.forAssignment.bind(this);
   }

   /**
    * Returns all tests cases associated with a particular assignment
    * @param {int} assignment_id 
    * @param {function} callback 
    */
   forAssignment(assignment_id, callback) {
      const sql = "SELECT * FROM assignment_tests WHERE assignment_id = $aid";
      const params = { $aid: assignment_id };
      this.db.all(sql, params, (err, rows) => {
         if (typeof (callback) !== "function") {
            callback = function (x, y) { };
         }
         if (err === null && rows !== undefined) {
            callback(rows, null);
         }
         else {
            console.log(err);
            callback(false, err);
         }
      });
   }

   log(assignment_id, user_id, test_name, test_input, test_result, callback) {

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

      //AC: placing db callback function into its own variable changes 
      //*this* from local AssignmentFilesDb object to result of sqlite3 db call.
      var local_callback = function (err) {
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
   }
}

exports.createTestCasesDb = function (db_connection) {
   return new TestCasesDb(db_connection);
}