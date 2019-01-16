import React, { Component } from 'react';
import Assignment from '../models/Assignment.js';

class TestCasesView extends Component {
   constructor(props){
      super(props);

      this.state = {
         test_cases: []
      };

      this.config = this.props.config;
      this.user = this.props.user;
      this.assignment_id = this.props.assignment_id;
      this.assignment_manager = new Assignment(this.config, true);
      this.getTestCases = this.getTestCases.bind(this);
   }

   componentDidMount(){
      this.getTestCases();
   }

   getTestCases(){
      this.assignment_manager.getTestCases(this.assignment_id)
      .then(result =>{
         this.setState({test_cases: result});
      })
      .catch(err => {
         console.log("Could not load test cases");
      });
   }

   render() {
      return (
         <div className="container">
            <div className="row">
            
            </div>
         </div>
      );
   }
}

export { TestCasesView };
export default TestCasesView;