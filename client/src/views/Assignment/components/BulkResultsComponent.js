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
         test_names: [], 
         test_results: [],
         oldest_test: "", // actually needs to be oldest out of (all newest for each test name)
         has_mismatch: false
      };

      this.getTestNames = this.getTestNames.bind(this); 
      this.getTestResults = this.getTestResults.bind(this);
      this.getClassResults = this.getClassResults.bind(this); 
      this.dateMismatch = this.dateMismatch.bind(this);
      this.rerunTests = this.rerunTests.bind(this);
      this.zipGradingFiles = this.zipGradingFiles.bind(this); 

   }

   componentDidMount() {
      this.getTestNames(this.props.assignment.id)
      .then(() =>  this.getClassResults(this.props.student_roster)); 
   }

   componentWillReceiveProps(new_props) {
      if (new_props.user !== null && new_props.user !== undefined && new_props.user.id > 0) {
         this.getClassResults(new_props.student_roster);
      }
   }

   zipGradingFiles()
   {
      this.props.models.assignment.zipGradingFiles(this.props.assignment.id)
      .then(blob => {
        // create a temp link for downloading ZIP data
         const url = URL.createObjectURL(new Blob([blob])); 
         const link = document.createElement('a');
         link.href = url;
         link.download = this.props.assignment.name + ".zip";
         link.click();
         window.URL.revokeObjectURL(link.href); 
      })
      .catch(err => {
         // TODO: handle error
      }); 
   }

   getTestNames() {
      return new Promise((resolve, reject) => {
         if (this.props.assignment.id > 0) {
            this.props.models.assignment.getTestCases(this.props.assignment.id)
            .then((results) => {
               let names = []; 
               for (const result of results) {
                  names.push(result.test_name); 
               }
               this.setState({test_names: names});
               resolve();  
            })
            .catch((err) => {
               reject(err);
               console.log(err);
            }); 
         }
      })
   }



   getTestResults(user_id) {
      let self = this;
      return new Promise((resolve, reject) => {
         let formatted_results = {}; 
         if (this.props.assignment.id > 0) {
            this.props.models.assignment.getTestResults(this.props.assignment.id, user_id)
               .then((results) => {
                  for (const result of results) {
                     if (formatted_results[result.test_name] === undefined) {
                        formatted_results[result.test_name] = [];
                     }
                     formatted_results[result.test_name].push(result);
                     self.dateMismatch(result);
                     self.setState({has_mismatch: result.has_mismatch});
                     if (self.state.oldest_test === "") {
                        self.setState({oldest_test: result.date_run});
                     }
                     else if (Date.parse(self.state.oldest_test) >= Date.parse(result.date_run)) {
                        self.setState({oldest_test: result.date_run});
                     }
                  }
                  for(const name of this.state.test_names)
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

   async getClassResults(student_roster) {
      let self = this;
      let class_results = []; 
      // get test results for each student in class 
         for(const student of student_roster) {
            // create object to hold necessary data, including an object where 
            // key = test name and value = Array of test results for that test case 
            let student_row = {id: student.id, name: student.name, results: {}, oldest_test: self.state.oldest_test, has_mismatch: self.state.has_mismatch};
            student_row.results = await this.getTestResults(student.id); 
            student_row.oldest_test = self.state.oldest_test;
            student_row.has_mismatch = self.state.has_mismatch;
            self.setState({oldest_test: ""});
            class_results.push(student_row); 
         }
         this.setState({ test_results: class_results }); 
   }

   dateMismatchHelper(assignment_id, user_id)
   {
      //let self = this;
      var found = false;
      return new Promise((resolve, reject) => {
         if (assignment_id > 0 && user_id > 0) {
            this.props.models.assignment.dateMismatch(assignment_id, user_id)
            .then((results) => {
               if (results[0] != null) {
                  found = true;
               }
               resolve(found);
            })
            .catch((err) => {
               console.log(err);
               reject(err); 
            });
         }
      });
   }

   dateMismatch(test_result) {

      var assignment_id = ""
      var user_id = ""
      var test_name = ""
      assignment_id = test_result.assignment_id;
      user_id = test_result.user_id;
      test_name = test_result.test_name;
      if (assignment_id > 0 && user_id > 0) {
         this.props.models.assignment.dateMismatch(assignment_id, user_id, test_name);
      }
   }

   async dateMismatchOld(test_result) {
      var test_result_obj = ""
      var mismatch = ""
      for(var key in test_result) {
         test_result_obj = test_result[key][0];
         mismatch = await this.dateMismatchHelper(test_result_obj.assignment_id, test_result_obj.user_id);
         return mismatch;}
       
   }

   compile(assignment_id, test_input, test_name) {
      this.props.models.assignment.compile(assignment_id, test_input, test_name);
      // needs to reset has_mismatch values for that user and assignment
      // needs to be a different function that takes in student id; current ver of compile uses logged in user id
   }

   rerunTests(item) {
      for (var key in item.results)
      {
         var test = item.results[key];
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

      let dateStyle = {
         backgroundColor: 'red'
      };

      // array of test names --> table columns
      const headers = this.state.test_names; 
      // array of students, where each student has test results associated with 
      // them --> one table row per student 
      const data = this.state.test_results;
      // json property containing the actual output in a test result object
      const json_result_field = "test_result"; 
      

      return (
        <article className="container">
           <article>
               <table className = "table center">
                  <tbody>
                     <tr>
                        <th><button className="btn btn-primary" onClick={() => { this.zipGradingFiles() }}>Download Details</button></th>
                     </tr>
                  </tbody>
               </table>

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
                              <td style={dateStyle}>{item.oldest_test}</td>
                              ) : (
                              <td>{item.oldest_test}</td>
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