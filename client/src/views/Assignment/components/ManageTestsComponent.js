import React, { Component } from 'react';
import { connect } from "react-redux";
import { ArrayIndexSelect } from '../../components/Selectors.js';
import { Redirect } from 'react-router'; 
import Fade from 'bootstrap'; 

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class ManageTestsComponent extends Component {
   constructor(props) {
      super(props);

      this.new_test_name = "Create a new test"; 
      this.state = {
         can_edit_tests: false, 
         test_cases: [],
         test_names: [],
         selected_test_index: 0,
         selected_test: { test_name: "" }, 
         show_changes_saved: false, 
         test_result: "",
         is_submitting_changes: false
      };

      this.getTestCases = this.getTestCases.bind(this);
      this.testCaseChanged = this.testCaseChanged.bind(this); 
      this.testCaseSelected = this.testCaseSelected.bind(this);
      this.handleFormSubmit = this.handleFormSubmit.bind(this);
   }

   handleFormSubmit(evt) {
      evt.preventDefault();
      this.setState({ is_submitting_changes: true }, () => {
         this.props.models.assignment.createTestCase(this.props.assignment.id, this.state.selected_test.id, this.state.selected_test.test_name, this.state.selected_test.test_input, this.state.selected_test.test_description)
            .then(result => {
               this.setState({ is_submitting_changes: false, show_changes_saved: true });
               setTimeout(() => {
                  this.setState({ show_changes_saved: false});  
               }, 5000); 
               this.getTestCases();
            })
            .catch(result => {
               this.setState({ test_result: result, is_submitting_changes: false });
            });
      });

   }

   componentDidMount() {
      const privilege = this.props.models.course.getCoursePrivileges(this.props.current_user.course_role);
      if(privilege.can_modify_course === true) {
         this.setState({can_edit_tests: true}); 
         this.getTestCases()
         .finally(() => {
            if(this.state.test_cases.length > 0) {
               this.setState({ selected_test_index: 0, selected_test: this.state.test_cases[0] });
            }
         });
      }
      else {
         this.setState({can_edit_tests: false}); 
      }
   }

   componentWillReceiveProps(new_props) {
      if(new_props.assignment !== null && new_props.assignment !== undefined){
         this.getTestCases(new_props.assignment.id);
      }
   }

   testCaseSelected(evt) {
      this.setState({
         selected_test_index: evt.target.value,
         selected_test: this.state.test_cases[evt.target.value],
         show_changes_saved: false
      });
   }

   testCaseChanged(evt) {
      let test = Object.assign({}, this.state.selected_test);
      let name = evt.target.name;  
      test[name] = evt.target.value; 
      this.setState({
         selected_test: test
      }); 
   }

   getTestCases(assignment_id = null) {
      return new Promise((resolve, reject) => {
         if(assignment_id === null){
            assignment_id = this.props.assignment.id;
         }
         this.props.models.assignment.getTestCases(assignment_id)
            .then(result => {
               //add option for custom test
               result.push({
                  id: -1, 
                  test_name: this.new_test_name,
                  test_input: "",
                  test_description: ""
               });
               let test_names = [];
               for (let test of result) {
                  test_names.push(test.test_name);
               }
               this.setState({
                  test_cases: result,
                  test_names: test_names
               });
               resolve(); 
            })
            .catch(err => {
               console.log("Could not load test cases");
               reject(); 
            });
      })
   }

render() {
      let submit_text = "submitting changes...";
      if (this.state.is_submitting_changes === false) {
         submit_text = "";
      }

      let changes_saved_text = "changes saved!"; 
      if(this.state.show_changes_saved === false) {
         changes_saved_text = ""; 
      }

      if(this.props.modify_permissions === false)
      {
         return(<Redirect to="/assignment" />);
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
                        id="TestCaseName"
                        name="test_name"
                        type="text"
                        className="form-control"
                        value={this.state.selected_test.test_name === this.new_test_name ? "" : this.state.selected_test.test_name}
                        onChange={this.testCaseChanged}
                        required="required"
                    />
                </div>
                <div className="form-group">
                  <label htmlFor="TestCaseDesc">Test Description</label>
                  <textarea
                     id="TestCaseDesc"
                     name="test_description"
                     rows="5"
                     className="form-control"
                     value={this.state.selected_test.test_description}
                     onChange={this.testCaseChanged} />
               </div>
               <div className="form-group">
                  <label htmlFor="TestCaseInput">Test Input</label>
                  <textarea
                     id="TestCaseInput"
                     name="test_input"
                     rows="5"
                     className="form-control"
                     value={this.state.selected_test.test_input}
                     onChange={this.testCaseChanged}
                     required="required" />
               </div>
               <button
                  type="Submit"
                  disabled={this.state.is_submitting_changes}
                  className="btn btn-outline-primary">Submit Changes</button>
                  <br />
                  <span>{submit_text}</span> 
                  <span>{changes_saved_text}</span>
            </form>
         </div >
      );
   }
}

const ManageTests = connect(mapStateToProps)(ManageTestsComponent);
export { ManageTests };
export default ManageTests;