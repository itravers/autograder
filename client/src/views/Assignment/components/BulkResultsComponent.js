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
         test_results: []
      };

      this.getTestCases = this.getTestCases.bind(this); 
      this.getTestResults = this.getTestResults.bind(this);
      this.getClassResults = this.getClassResults.bind(this); 
      this.rerunTests = this.rerunTests.bind(this);
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

   // 
   async getClassResults(student_roster) {
      let class_results = []; 
      // get test results for each student in class 
         for(const student of student_roster) {
            // create object to hold necessary data, including a results object 
            // where key = test name and value = array of test results for that 
            // test case, sorted with most recent result first  
            let student_row = {id: student.id, name: student.name, results: {}, oldest_test_date: "", has_mismatch: false};
            student_row.results = await this.getTestResults(student.id); 

            // get the least recently run test of all current test results for 
            // this student, and flag if any are outdated
            let oldest_test_date = ""; 
            for(const test_name of Object.keys(this.state.test_cases))
            {
               if (student_row.results.hasOwnProperty(test_name) && student_row.results[test_name][0] !== undefined) {
                  let test = student_row.results[test_name][0];
                  if (oldest_test_date === "" || (Date.parse(oldest_test_date) > Date.parse(test.date_run))) {
                     oldest_test_date = test.date_run;
                  }
                  if (test.is_outdated === 1) {
                     student_row.has_mismatch = true; 
                  }
               }
            }
            student_row.oldest_test_date = oldest_test_date; 
            class_results.push(student_row); 
         }
         this.setState({ test_results: class_results }); 
   }

   compile(assignment_id, test_input, test_name) {
      this.props.models.assignment.compile(assignment_id, test_input, test_name);
      // needs to reset has_mismatch values for that user and assignment --> can re-run "get class test results" function? 
      // or can re-run "get test results for this student" and update state variable with this 
      // needs to be a different function that takes in student id; current ver of compile uses logged in user id
   }
 
   // reruns all named test cases on this assignment for the given student 
   rerunTests(student) {
      for (var key in student.results)
      {
         var test = student.results[key];
         var assignment_id = test[0].assignment_id;
         var test_input = test[0].test_input;
         var test_name = test[0].test_name;
         this.props.models.assignment.compile(assignment_id, test_input, test_name);
      }
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
      
      return (
        <article className="container">
           <article>
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
                              <td key={index}>{item.results[test_name][0][json_result_field]}</td>
                           )}
                           {item.has_mismatch ? 
                           (
                              <td className="bg-warning">{item.oldest_test_date}</td>
                              ) : (
                              <td>{item.oldest_test_date}</td>
                           )}
                           {item.has_mismatch ? 
                           (
                              <td><button className="btn btn-primary" onClick={() => { this.rerunTests(item) }}>Run</button></td>
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