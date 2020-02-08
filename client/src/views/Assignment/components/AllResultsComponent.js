import React, { Component } from 'react';
import { connect } from "react-redux";
import { Redirect } from 'react-router'; 

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class AllResultsComponent extends Component {

   constructor(props) {
      super(props);

      this.state = {
         test_names: [], 
         test_results: []
      };

      this.getTestNames = this.getTestNames.bind(this); 
      this.getTestResults = this.getTestResults.bind(this);
      this.getClassResults = this.getClassResults.bind(this); 
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
               console.log(err)
            }); 
         }
      })
   }

   getTestResults(user_id) {
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
                  }
                  for(const name of this.state.test_names)
                  {
                     if(formatted_results[name] === undefined || formatted_results[name].length === 0) {
                        formatted_results[name] = [{test_result: ""}]; 
                     }
                  }
                  resolve(formatted_results); 
               })
               .catch((err) => console.log(err));
         }
      });
   }

   async getClassResults(student_roster) {
      let class_results = []; 
      // get test results for each student in class 
         for(const student of student_roster) {
            // create object to hold necessary data, including an object where 
            // key = test name and value = Array of test results for that test case 
            let student_row = {id: student.id, name: student.name, results: {}};
            student_row.results = await this.getTestResults(student.id); 
            class_results.push(student_row); 
         }
         this.setState({ test_results: class_results }); 
   }

   render() {
      if(this.props.modify_permissions === false)
      {
        return(<Redirect to="/assignment" />);
      }
    
      const headers = this.state.test_names; 
      const data = this.state.test_results;

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
                     </tr>
                  </thead>
                  <tbody> 
                     {data.map((item, index) =>
                        <tr key={index}>
                           <td>
                           {item.name}
                           </td>
                           {headers.map((test_name, index) =>
                              <td key={index}>{item.results[test_name][0]["test_result"]}</td>
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

const AllResults = connect(mapStateToProps)(AllResultsComponent);
export { AllResults };
export default AllResults;