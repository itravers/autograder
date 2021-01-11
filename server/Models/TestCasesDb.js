const sqlite3 = require('sqlite3').verbose();
let fs = require('fs');
let path = require('path');

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
   createTest(assignment_id, test_name, test_input, test_description) {
      let sql = "INSERT INTO assignment_tests "; 
      let columns = "(assignment_id, test_input"; 
      let values = "VALUES ($assignment_id, $test_input";
      let params = {
         $assignment_id: assignment_id,
         $test_input: test_input
      }
      if(test_name !== undefined && test_name.length > 0) {
         columns += ", test_name";
         values += ", $test_name"; 
         params.$test_name = test_name; 
      }
      if(test_description !== undefined && test_description.length > 0) {
         columns += ", test_description";
         values += ", $test_description";
         params.$test_description = test_description; 
      }
      columns += ") "; 
      values += ") "; 
      sql += columns + values; 
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
    * Updates given assignment's test results to indicate that they are outdated.
    * @param {Number} assignment_id The assignment's ID number (integer). 
    * @param {Number} user_id The user's ID number (integer). 
    * @returns {Promise} Resolves with number of rows that were updated if 
    *    successful; rejects if there's an error. 
    */

   updateTestOutdated(assignment_id, user_id) {   
      const sql = "UPDATE test_results SET is_outdated = true WHERE user_id = $user_id AND assignment_id = $assignment_id";
      const params = {
         $user_id: user_id,
         $assignment_id: assignment_id,
      };
      return new Promise((resolve, reject) => {

         //AC: placing db callback function into its own variable changes 
         //*this* from local AssignmentFilesDb object to result of sqlite3 db call.
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
    * Returns all students' tests results associated with a particular assignment.
    * @param {Number} assignment_id The assignment's ID number (integer). 
    * @returns {Promise} Resolves with assignment directory's name if successful; rejects if there's an error. 
    */
   downloadResults(assignment_id, dir_name = assignment_id + "_" + Date.now()) {
      const sql = "SELECT a.name AS assignment_name, u.name, t.test_name, t.test_input, t.test_result FROM assignments a, users u, test_results t WHERE t.assignment_id = $aid AND a.id= $aid AND u.id = t.user_id";
      const params = { $aid: assignment_id };
      return new Promise((resolve, reject) => {
         this.db.all(sql, params, (err, rows) => {
            if (err === null && rows !== undefined) {
               if(rows.length > 0 ) {
                  const output = [];
                  output.push("Student Name, Test Name, Test Input, Test Result");
                  rows.forEach((r)=> {
                     const row = [];
                     row.push(`"${r.name}"`);
                     row.push(`"${r.test_name}"`);
                     row.push(`"${r.test_input}"`);
                     row.push(`"${r.test_result}"`);

                     output.push(row.join());
                  });
                  let directory = path.resolve('..', 'data', 'temp', 'downloads', dir_name, 'Student Results');
                  let filename = path.resolve(directory, rows[0].assignment_name + '_results.csv'); 
                  // creates the desired directory + all parents as necessary
                  fs.promises.mkdir(directory, {recursive: true})
                  // then writes to the desired file 
                  .then(x => fs.promises.writeFile(filename, output.join("\n")))
                  .then(() => resolve(dir_name)); 
               }
               else {
                  resolve(dir_name); 
               }
            }
            else {
               console.log(err);
               reject(err); 
            }
         });
      });
   }

   /**
    * Updates a test case's fields.
    * @param {Number} assignment_id The assignment's ID number (integer).
    * @param {Number} test_id The test's ID number (integer). 
    * @param {String} test_name The test case's name. 
    * @param {String} test_input What the input should be when running this test.
    * @param {String} test_desc A description of the test case. 
    * @returns {Promise} Resolves with the number of tests affected (1) if successful;
    *    rejects if there's an error. 
    */

   editTest(assignment_id, test_id, test_name, test_input, test_description)
   {
      let sql = " UPDATE assignment_tests "; 
      let set = "SET test_input = $test_input";
      let params = { 
         $a_id: assignment_id,
         $test_id: test_id, 
         $test_input: test_input, 
      };
      if(test_name !== undefined)
      {
         set += ", test_name = $test_name"; 
         params.$test_name = test_name;
      } 
      if(test_description !== undefined)
      {
         set += ", test_description = $test_description"; 
         params.$test_description = test_description; 
      }
      sql += set + " WHERE id = $test_id AND assignment_id = $a_id"; 
      
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
    * Updates a test case's fields.
    * @param {Number} assignment_id The assignment's ID number (integer).
    * @param {Number} test_id The test's ID number (integer). 
    * @param {String} test_name The test case's name. 
    * @param {String} test_input What the input should be when running this test.
    * @param {String} test_desc A description of the test case. 
    * @returns {Promise} Resolves with the number of tests affected (1) if successful;
    *    rejects if there's an error. 
    */

   editTest(assignment_id, test_id, test_name, test_input, test_description)
   {
      let sql = " UPDATE assignment_tests "; 
      let set = "SET test_input = $test_input";
      let params = { 
         $a_id: assignment_id,
         $test_id: test_id, 
         $test_input: test_input, 
      };
      if(test_name !== undefined)
      {
         set += ", test_name = $test_name"; 
         params.$test_name = test_name;
      } 
      if(test_description !== undefined)
      {
         set += ", test_description = $test_description"; 
         params.$test_description = test_description; 
      }
      sql += set + " WHERE id = $test_id AND assignment_id = $a_id"; 
      
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
    * Ensures that the test ID is unique for the given assignment.
    * @param {Number} assignment_id The assignment's ID number (integer).
    * @param {String} test_id The ID of the test case.
    * @returns {Promise} Resolves with true if the combination of these arguments is unique in the database;
    *    rejects with false otherwise. 
    */
   isUnique(assignment_id, test_id) {
      return new Promise((resolve, reject) => {
         const sql = "SELECT * FROM assignment_tests "
            + "WHERE assignment_id = $assignment_id "
            + "AND id = $test_id";
         this.db.get(sql, { $assignment_id: assignment_id, $test_id: test_id }, (err, row) => {
            if (err === null && row !== undefined) {
               reject(false);
               return;
            }
            else if (err !== null) {
               reject(err); 
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