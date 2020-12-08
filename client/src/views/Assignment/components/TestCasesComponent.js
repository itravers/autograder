import React, { Component } from 'react';
import { connect } from "react-redux";
import { ArrayIndexSelect } from '../../components/Selectors.js';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class TestCasesComponent extends Component {
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

      this.getTestCases = this.getTestCases.bind(this);
      this.testCaseSelected = this.testCaseSelected.bind(this);
      this.testInputChanged = this.testInputChanged.bind(this);
      this.handleFormSubmit = this.handleFormSubmit.bind(this);
      this.assignmentSubmit = this.assignmentSubmit.bind(this);
   }

   handleFormSubmit(evt) {
      evt.preventDefault(); 
      this.setState({ is_running_test: true }, () => {
         this.props.models.assignment.compile(this.props.assignment.id, this.props.selected_user.id, this.state.selected_test.test_input, this.state.selected_test.test_name)
            .then(result => {
               this.props.getAssignmentFiles(); 
               let displayed_result = result; 
               if (result === "" || result === false) {
                  displayed_result = "[no output given]"; 
               }
               this.setState({ test_result: displayed_result, is_running_test: false });
            })
            .catch(result => {
               this.setState({ test_result: result, is_running_test: false });
            });
      });

   }

   componentDidMount() {
      this.getTestCases();
   }

   componentWillReceiveProps(new_props) {
      if(new_props.assignment !== null && new_props.assignment !== undefined){
         this.getTestCases(new_props.assignment.id);
      }
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

   getTestCases(assignment_id = null) {
      if(assignment_id === null){
         assignment_id = this.props.assignment.id;
      }
      this.props.models.assignment.getTestCases(assignment_id)
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

   assignmentSubmit(assignment_id = null)
   {
      const user_id = this.props.current_user.id;
      if (assignment_id === null)
      {
         assignment_id = this.props.assignment.id;
      }
      this.props.models.assignment.submitAssignment(this.props.assignment.id, user_id);
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
               <br />
               <button
                  type="Submit"
                  disabled={this.state.is_running_test}
                  onClick={this.assignmentSubmit}
                  className="btn btn-outline-primary">Submit for Instructor Review</button> <br />
               <br />
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

const TestCases = connect(mapStateToProps)(TestCasesComponent);
export { TestCases };
export default TestCases;