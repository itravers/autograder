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
         test_result: "",
         is_running_test: false
      };

      this.config = this.props.config;
      this.assignment_id = this.props.assignment_id;
      this.assignment_manager = new Assignment(this.config, true);
      this.getTestCases = this.getTestCases.bind(this);
      this.testCaseSelected = this.testCaseSelected.bind(this);
      this.testInputChanged = this.testInputChanged.bind(this);
      this.handleFormSubmit = this.handleFormSubmit.bind(this);
   }

   handleFormSubmit(evt) {
      evt.preventDefault();
      this.setState({ is_running_test: true }, () => {
         this.assignment_manager.compile(this.assignment_id, this.state.selected_test.test_input)
            .then(result => {
               this.setState({ test_result: result, is_running_test: false });
            })
            .catch(result => {
               this.setState({ test_result: result, is_running_test: false });
            });
      });

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

   testInputChanged(evt) {
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
      let test_result_classes = "row";
      if (this.state.test_result === "") {
         test_result_classes += " d-none";
      }
      let running_text = "running test...";
      if (this.state.is_running_test === false) {
         running_text = "";
      }
      return (
         <div className="container">
            <form onSubmit={this.handleFormSubmit}>
               <div className="form-group">
                  <label htmlFor="TestCaseSelect">Test Case</label>
                  <ArrayIndexSelect
                     id="TestCaseSelect"
                     data={this.state.test_names}
                     selectedValue={this.state.selected_test_index}
                     onChange={this.testCaseSelected}
                     size={this.state.test_names.length}
                     name="selected_test_index"
                     className="form-control"
                  />
               </div>
               <div className="form-group">
                  <label htmlFor="TestCaseDescription">{this.state.selected_test.test_description}</label>
                  <textarea
                     id="TestCaseDescription"
                     rows="5"
                     className="form-control"
                     value={this.state.selected_test.test_input}
                     onChange={this.testInputChanged} />
               </div>
               <button 
               type="Submit" 
               disabled={this.state.is_running_test} 
               className="btn btn-outline-primary">Run Test</button> <br />
               <span>{running_text}</span>
            </form>
            <div className={test_result_classes}>
               <div className="col border border-secondary rounded">
                  <h2>Test Results</h2>
                  {this.state.test_result}
               </div>
            </div>
         </div >
      );
   }
}

export { TestCasesView };
export default TestCasesView;