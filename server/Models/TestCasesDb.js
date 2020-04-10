const sqlite3 = require('sqlite3').verbose();
var fs = require('fs');

class TestCasesDb {

   /**
    * TestCasesDb constructor.
    * @param {*} db_connection The database connection. 
    */
   constructor(db_connection) {
      this.db = db_connection;

      this.forAssignment = this.forAssignment.bind(this);
      this.log = this.log.bind(this);
      this.testResults = this.testResults.bind(this); 
   }

   /**
    * Creates a test case for an assignment.
    * @param {Number} assignment_id The assignment's ID number (integer). 
    * @param {String} test_name The test case's name. 
    * @param {String} test_input What the input should be when running this test.
    * @param {String} test_desc A description of the test case. 
    * @returns {Promise} Resolves with the new test case's ID if successful;
    *    rejects if there's an error. 
    */
   createTest(assignment_id, test_name, test_input, test_desc) {
      const sql = "INSERT INTO assignment_tests " +
         " (assignment_id, test_name, test_input, test_description) " +
         " VALUES ($assignment_id, $test_name, $test_input, $test_desc) ";
      const params = {
         $assignment_id: assignment_id,
         $test_name: test_name,
         $test_input: test_input,
         $test_desc: test_desc
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
    * Returns all students' tests results associated with a particular assignment.
    * @param {Number} assignment_id The assignment's ID number (integer). 
    * @returns {Promise} Resolves with all test cases if successful; rejects if no 
    *    test results exist for this assignment or if there's an error. 
    */
   downloadResults(assignment_id) {
      const sql = "SELECT a.name AS assignment_name, u.name, t.test_name, t.test_input, t.test_result FROM assignments a, users u, test_results t WHERE t.assignment_id = $aid AND a.id= $aid AND u.id = t.user_id";
      const params = { $aid: assignment_id };
      return new Promise((resolve, reject) => {
         this.db.all(sql, params, (err, rows) => {
            if (err === null && rows !== undefined) {
                const output = [];
                output.push("Student Name, Test Name, Test Input, Test Result");
                rows.forEach((r)=> {
                  const row = [];
                  row.push(`"${r.name}"`);
                  row.push(`"${r.test_name}"`);
                  row.push(`"${r.test_input}"`);
                  row.push(`"${r.test_result}"`);

                  output.push(row.join());
                })

                let path ="../data/"
                let filename = path + rows[0].assignment_name + "_results.csv";
                fs.writeFileSync(filename, output.join("\n"));
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
    * Returns all tests cases associated with a particular assignment.
    * @param {Number} assignment_id The assignment's ID number (integer). 
    * @returns {Promise} Resolves with all test cases if successful; rejects if no 
    *    test cases exist for this assignment or if there's an error. 
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
    * Ensures that the test input is unique for the given assignment.
    * @param {Number} assignment_id The assignment's ID number (integer).
    * @param {String} test_input The input for the test case.
    * @returns {Promise} Resolves with true if the combination of these arguments is unique in the database;
    *    rejects with false otherwise. 
    */
   isUnique(assignment_id, test_input) {
      return new Promise((resolve, reject) => {
         const sql = "SELECT * FROM assignment_tests "
            + "WHERE assignment_id = $id "
            + "AND test_input = $input ";
         this.db.get(sql, { $id: assignment_id, $input: test_input }, (err, row) => {
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

   /**
    * Records test results in the database. 
    * @param {Number} assignment_id The assignment's ID nnumber (integer).
    * @param {Number} user_id The ID number for the assignment's owner (integer). 
    * @param {String} test_name The test case's name. 
    * @param {String} test_input Input for the test. 
    * @param {String} test_result Results of running the test. 
    * @returns {Promise} Resolves with the ID of the new row inserted in the DB if 
    *    successful; rejects with error otherwise. 
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
    * @param {Number} assignment_id The assignment's ID number (integer).
    * @param {Number} user_id The user's ID number (integer). 
    * @returns {Promise} Resolves with all the test results for this user's assignment, or 
    *    rejects with error if unsuccessful. 
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

/**
 * Contains methods to interact with records of test cases in the database. 
 * @typedef {Object} TestCasesDb
 */

/**
 * Creates a new TestCasesDb.
 * @param {Object} db_connection Database connection.
 * @returns {TestCasesDb} Instance of TestCasesDb.
 */
exports.createTestCasesDb = function (db_connection) {
   return new TestCasesDb(db_connection);
}