import React, { Component } from 'react';
import { connect } from "react-redux";
import { ArrayIndexSelect } from '../../components/Selectors.js';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class ManageTestsComponent extends Component {
   constructor(props) {
      super(props);

      this.state = {
         test_cases: [],
         test_names: [],
         selected_test_index: 0,
         selected_test: {},
         test_result: "",
         is_submitting_changes: false
      };

      this.getTestCases = this.getTestCases.bind(this);
      this.testCaseSelected = this.testCaseSelected.bind(this);
      this.testNameChanged = this.testNameChanged.bind(this); 
      this.testDescChanged = this.testDescChanged.bind(this); 
      this.testInputChanged = this.testInputChanged.bind(this);
      this.handleFormSubmit = this.handleFormSubmit.bind(this);
   }

   handleFormSubmit(evt) {
      evt.preventDefault();
      this.setState({ is_submitting_changes: true }, () => {
         this.props.models.assignment.compile(this.props.assignment.id, this.state.selected_test.test_input, this.state.selected_test.test_name)
            .then(result => {
               this.setState({ test_result: result, is_submitting_changes: false });
            })
            .catch(result => {
               this.setState({ test_result: result, is_submitting_changes: false });
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

    testNameChanged(evt) {
        let test = Object.assign({}, this.state.selected_test);
        test.test_name = evt.target.value;
        this.setState({
            selected_test: test
        });
    }

    testDescChanged(evt) {
      let test = Object.assign({}, this.state.selected_test);
      test.test_description = evt.target.value;
      this.setState({
          selected_test: test
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

render() {
    /*  
    let test_result_classes = "row";
      if (this.state.test_result === "") {
         test_result_classes += " d-none";
      }*/
      let submit_text = "submitting changes...";
      if (this.state.is_submitting_changes === false) {
         submit_text = "";
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
                    <label htmlFor="TestCaseName">Test Name</label>
                    <input 
                        type="text"
                        className="form-control"
                        value={this.state.selected_test.test_name}
                        onChange={this.testNameChanged}
                    />
                </div>
                <div className="form-group">
                   <label htmlFor="TestCaseDescription"> Test Description</label>
                   <textarea  
                     id="TestCasesDescription"
                     rows="3"
                     className="form-control"
                     value={this.state.selected_test.test_description}
                     onchange={this.testDescChanged} 
                     />
                </div>
               <div className="form-group">
                  <label htmlFor="TestCaseInput">Test Input</label>
                  <textarea
                     id="TestCaseInput"
                     rows="5"
                     className="form-control"
                     value={this.state.selected_test.test_input}
                     onChange={this.testInputChanged} />
               </div>
               <button
                  type="Submit"
                  disabled={this.state.is_submitting_changes}
                  className="btn btn-outline-primary">Submit Changes</button> <br />
            </form>
         </div >
      );
   }
}

const ManageTests = connect(mapStateToProps)(ManageTestsComponent);
export { ManageTests };
export default ManageTests;