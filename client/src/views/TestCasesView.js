import React, { Component } from 'react';
import Assignment from '../models/Assignment.js';
import { ArrayIndexSelect } from './components/Selectors.js';

class TestCasesView extends Component {
   constructor(props) {
      super(props);

      this.state = {
         test_cases: [],
         test_names: [],
         selected_test_index: 0,
         selected_test: {},
      };

      this.config = this.props.config;
      this.assignment_id = this.props.assignment_id;
      this.assignment_manager = new Assignment(this.config, true);
      this.getTestCases = this.getTestCases.bind(this);
      this.testCaseSelected = this.testCaseSelected.bind(this);
      this.testInputChanged = this.testInputChanged.bind(this);
   }

   componentDidMount() {
      this.getTestCases();
   }

   testCaseSelected(evt) {
      this.setState({
         selected_test_index: evt.target.value,
         selected_test: this.state.test_cases[evt.target.value]
      });
   }

   testInputChanged(evt){
      let test = Object.assign({}, this.state.selected_test);
      test.test_input = evt.target.value;
      this.setState({
         selected_test: test
      });
   }

   getTestCases() {
      this.assignment_manager.getTestCases(this.assignment_id)
         .then(result => {
            //add option for custom test
            result.push({
               test_name: "Custom Test",
               test_input: "",
               test_description: "Write a custom test for your software"
            });
            let test_names = [];
            for (let test of result) {
               test_names.push(test.test_name);
            }
            this.setState({ 
               test_cases: result, 
               test_names: test_names,
               selected_test: result[0]
            });
         })
         .catch(err => {
            console.log("Could not load test cases");
         });
   }

   render() {
      return (
         <div className="container">
            <div className="row">
               <div className="col">
                  <ArrayIndexSelect
                     data={this.state.test_names}
                     selectedValue={this.state.selected_test_index}
                     onChange={this.testCaseSelected}
                     size={this.state.test_names.length}
                     name="selected_test_index"
                     />
               </div>
               <div className="col">
                  {this.state.selected_test.test_description}
                  <textarea
                     rows="8"
                     cols="40"
                     value={this.state.selected_test.test_input} 
                     onChange={this.testInputChanged} />
               </div>
               <div className="col">
                  Test results
               </div>
            </div>
         </div>
      );
   }
}

export { TestCasesView };
export default TestCasesView;