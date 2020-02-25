import React, { Component } from 'react';
import { connect } from "react-redux";
import { sortBy } from 'lodash';
import UserList from './../components/UserList'
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';


const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class AssignmentsListView extends Component {

   constructor(props) {
      super(props);

      this.state = {
         courses: [],
         selected_course: Number(this.props.match.params.id),
         current_course_role: -1,
         selected_assignment: -1,
         course_assignments: []
      };

      this.updateSelectedCourse = this.updateSelectedCourse.bind(this);
      this.formatCourseName = this.formatCourseName.bind(this);
      this.getAssignmentsForCourse = this.getAssignmentsForCourse.bind(this);
      this.getCourses = this.getCourses.bind(this);
      this.lockAssignment = this.lockAssignment.bind(this);
      this.viewAssignment = this.viewAssignment.bind(this);
   }

   componentDidMount() {
      this.getCourses(this.props.current_user);
      this.getAssignmentsForCourse();
   }

   getCourses() {
      this.props.models.course.getCoursesForUser()
         .then((result) => {
            let courses_taught = [];
            for (let course of result) {
               const course_role = this.props.models.course.getCoursePrivileges(course.course_role);
               if (course_role.can_modify_course === true || course_role.can_grade_assignment === true || course_role.can_submit_assignment === true) {
                  courses_taught.push(course);
               }
            }
            this.setState({ courses: courses_taught });
         })
         .catch(err => { });
   }

   updateSelectedCourse(evt) {
      this.setState({ selected_course: this.state.courses[evt.target.selectedIndex].id },
         this.getAssignmentsForCourse
      );
      this.props.history.push(`/course/${evt.target.value}/assignments`);
   }

   formatCourseName(course) {
      return course.name + " - " + course.term + " " + course.year;
   }

   lockAssignment(evt) {
      const index = Number(evt.target.dataset.id);
      const assignment = this.state.course_assignments[index];
      this.props.models.assignment.lockAssignment(assignment.id);
      this.getAssignmentsForCourse();
   }

   viewAssignment(evt) {
      const index = Number(evt.target.dataset.id);
      const assignment = this.state.course_assignments[index];
      this.setState({selected_assignment: assignment.id});
   }

   getAssignmentsForCourse() {
      var state = this.state;
      var props = this.props;
      props.models.course.getActiveAssignmentsForCourse(state.selected_course)
         .then((result) => {
            let assignments_list = [];
            for (let assignment of result) {
               const course_role = props.models.course.getCoursePrivileges(state.current_course_role);
               if (course_role.can_modify_course === true || course_role.can_grade_assignment === true || course_role.can_submit_assignment === true) {
                  assignments_list.push(assignment);
               }
            }
            this.setState({ course_assignments: assignments_list });
         })
         .catch(err => {console.log(err); });
   }

   render() {
      const self = this;
      const headers = ['Assignment', 'Locked'];
      const assignment_headers = ['name', 'is_locked'];
      const assignment_buttons = [{ text: "Lock/Unlock", click: this.lockAssignment }, { text: "View", click: this.viewAssignment }];
      if (self.state.selected_assignment !== -1)
      {
         return(<Redirect to= {"/assignment/" + self.state.selected_assignment} />);
      }
      return (
         <article className="container">
            <select value={this.state.selected_course} onChange={this.updateSelectedCourse}>
               {this.state.courses.map((value, index) =>
                  <option
                     key={index}
                     value={value.course_id}>
                     {this.formatCourseName(value)}
                     {this.updateSelectedCourse}
                  </option>
               )}
            </select>
            <article>
               <h1>Assignments</h1>
               <UserList header={headers} raw_data={this.state.course_assignments} data_cols={assignment_headers} buttons={assignment_buttons} />
            </article>
         </article>
      );
   }
}

const AssignmentsList = connect(mapStateToProps)(AssignmentsListView);
export { AssignmentsList };
export default AssignmentsList;