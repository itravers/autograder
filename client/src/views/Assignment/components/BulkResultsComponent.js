import React, { Component } from 'react';
import { connect } from "react-redux";
import { Redirect } from 'react-router'; 

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class BulkResultsComponent extends Component {

   constructor(props) {
      super(props);

      this.state = {
         test_cases: {}, 
         test_results: [],
         is_running_tests: false,
         is_running_all_tests: false
      };

      this.getTestCases = this.getTestCases.bind(this); 
      this.getTestResults = this.getTestResults.bind(this);
      this.getClassResults = this.getClassResults.bind(this); 
      this.rerunStudentTests = this.rerunStudentTests.bind(this);
      this.rerunClassTests = this.rerunClassTests.bind(this); 
      this.zipGradingFiles = this.zipGradingFiles.bind(this);
   }

   componentDidMount() {
      this.getTestCases(this.props.assignment.id)
      .then(() =>  this.getClassResults(this.props.student_roster)); 
   }

   UNSAFE_componentWillReceiveProps(new_props) {
      if (new_props.user !== null && new_props.user !== undefined && new_props.user.id > 0) {
         this.getClassResults(new_props.student_roster);
      }
   }

   zipGradingFiles()
   {
      this.props.models.assignment.getGradingFilesLink(this.props.assignment.id)
      .then(url => {
        // create a temp link for downloading ZIP data
         const link = document.createElement('a');
         link.href = url;
         link.download = this.props.assignment.name + ".zip";
         link.click();
         window.URL.revokeObjectURL(link.href); 
      })
      .catch(err => {
         console.log(err); 
      }); 
   }

   // gets a list of test cases for this assignment, creates an object with
   // property test case names & value test case input, and sets state variable 
   // test_cases to this object
   getTestCases() {
      return new Promise((resolve, reject) => {
         if (this.props.assignment.id > 0) {
            this.props.models.assignment.getTestCases(this.props.assignment.id)
            .then((results) => {
               let tests = {}; 
               for (const result of results) {
                  tests[result.test_name] = result.test_input;
               }
               this.setState({test_cases: tests});
               resolve();  
            })
            .catch((err) => {
               reject(err);
               console.log(err);
            }); 
         }
      })
   }

   // returns an object containing all test results for the given user,
   // organized by test case name  
   getTestResults(user_id) {
      return new Promise((resolve, reject) => {
         // formatted_results will be an object with key = test name and value 
         // = array of test results, sorted from most to least recent
         let formatted_results = {}; 
         if (this.props.assignment.id > 0) {
            this.props.models.assignment.getTestResults(this.props.assignment.id, user_id)
               .then((results) => {
                  // sort test results by test name 
                  for (const result of results) {
                     // if the test case hasn't been added to formatted_results 
                     // yet, add it now 
                     if (formatted_results[result.test_name] === undefined) {
                        formatted_results[result.test_name] = [];
                     }
                     formatted_results[result.test_name].push(result);
                  }

                  // add any test names for which the student has no results 
                  for(const name of Object.keys(this.state.test_cases))
                  {
                     if(formatted_results[name] === undefined || formatted_results[name].length === 0) {
                        formatted_results[name] = [{test_result: ""}]; 
                     }
                  }
                  resolve(formatted_results); 
               })
               .catch((err) => {
                  console.log(err);
                  reject(err); 
               });
         }
      });
   }

   // gets test results for each student in the class and sets the state 
   // variable test_results to the resulting array 
   async getClassResults(student_roster) {
      let class_results = []; 
      // get test results for each student in class 
         for(const student of student_roster) {
            // create object to hold necessary data, including a results object 
            // where key = test name and value = array of test results for that 
            // test case, sorted with most recent result first  
            let student_row = {id: student.id, name: student.name, results: {}, oldest_test_date: "", has_mismatch: false, is_running_tests: false};
            student_row.results = await this.getTestResults(student.id); 
            student_row = await this.updateDateAndMismatch(student_row); 
            class_results.push(student_row); 
         }
         this.setState({ test_results: class_results }); 
   }

   // updates the has_mismatch and oldest_test values in a student object,
   // indicating if any of the current test results are outdated
   updateDateAndMismatch(student) {
      student.has_mismatch = false; 
      let oldest_test_date = ""; 
      for(const test_name of Object.keys(this.state.test_cases))
      {
         if (student.results.hasOwnProperty(test_name) && student.results[test_name][0] !== undefined) {
            let test = student.results[test_name][0];
            if (oldest_test_date === "" || oldest_test_date === undefined || (Date.parse(oldest_test_date) > Date.parse(test.date_run))) {
               oldest_test_date = test.date_run;
            }
            if (test.is_outdated === 1) {
               student.has_mismatch = true; 
            }
         }
      }
      student.oldest_test_date = oldest_test_date;
      return student;
   }
 
   // reruns all named test cases on this assignment for the given student 
   async rerunStudentTests(student) {
      // set state to indicate that this specific student is running tests 
      student.is_running_tests = true;
      let test_results_copy = [...this.state.test_results]
      let index = test_results_copy.findIndex((element) => element.id === student.id);
      test_results_copy[index] = student; 
      this.setState({ test_results: test_results_copy, is_running_tests: true }); 
      
      // rerun test cases sequentially
      for(const test_name in this.state.test_cases)
      {
         let assignment_id = this.props.assignment.id; 
         let test_input = this.state.test_cases[test_name]; 
         await this.props.models.assignment.compile(assignment_id, student.id, test_input, test_name); 
      }
      // then update this student's test results 
      student.results = await this.getTestResults(student.id);
      student = await this.updateDateAndMismatch(student);

      // finally, update array of class results for this student
      student.is_running_tests = false; 
      test_results_copy[index] = student; 
      this.setState({ test_results: test_results_copy, is_running_tests: false }); 
      return; 
   }

   // reruns all tests for the entire student roster 
   async rerunClassTests() {
      this.setState({ is_running_tests: true, is_running_all_tests: true }); 
      // call rerunStudentTests for each student in the test_results array
      const promises = this.state.test_results.map(this.rerunStudentTests);
      await Promise.all(promises);
      this.setState({ is_running_tests: false, is_running_all_tests: false });
      return; 
   }

   render() {
      if(this.props.modify_permissions === false)
      {
        return(<Redirect to="/assignment" />);
      }
    
      // array of test names --> table columns
      const headers = Object.keys(this.state.test_cases); 
      // array of students, where each student has test results associated with 
      // them --> one table row per student 
      const data = this.state.test_results;
      // json property containing the actual output in a test result object
      const json_result_field = "test_result"; 
      let running_all_text = "sit tight... this may take a while";
      if (this.state.is_running_all_tests === false) {
         running_all_text = "";
      }
      
      return (
        <article className="container">
           <article>
               <div style={{ padding: "1.1rem" }}>
                  <button
                           type="Submit"
                           disabled={this.state.is_running_tests || this.state.is_running_all_tests}
                           onClick={() => { this.rerunClassTests() }}
                           className="btn btn-outline-primary">Run all tests</button>
                  <br/>
                  <span>{running_all_text}</span>
               </div>

               <div>
                  <button className="btn btn-primary" onClick={() => { this.zipGradingFiles() }}>Download Details</button>
               </div>

               <table className = "table table-striped text-left">
                  <thead>
                     <tr>
                        <th scope="col"></th>
                        {headers.map((item, index) =>
                           <th key={index} scope="col">{item}</th>
                        )}
                        <th>Oldest Test Run</th>
                     </tr>
                  </thead>
                  <tbody> 
                     {data.map((item, index) =>
                        <tr key={index} className={index.class}>
                           <td>
                           {item.name}
                           </td>
                           {headers.map((test_name, index) => 
                              <td key={index} className={item.results[test_name][0].is_outdated ? ("bg-warning") : ("")}>
                                 {item.results[test_name][0][json_result_field]}
                              </td>
                           )}
                              <td>{item.oldest_test_date}</td>
                           {item.has_mismatch ? 
                           (
                              <td><button type="Submit"
                                          className="btn btn-primary" 
                                          onClick={() => { this.rerunStudentTests(item) }}
                                          disabled={item.is_running_tests || this.state.is_running_all_tests}>
                                    Run
                                 </button>
                              </td>
                           ) : (
                              <td></td>
                           )}
                        </tr>
                     )}
                  </tbody>
               </table> 
           </article>
        </article> 
      );
   }
}

const BulkResults = connect(mapStateToProps)(BulkResultsComponent);
export { BulkResults };
export default BulkResults;