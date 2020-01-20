import React, { Component } from 'react';
import { connect } from "react-redux";
import { sortBy } from 'lodash';
import UserList from './../components/UserList'


const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class AssignmentsList extends Component {

   constructor(props) {
      super(props);

      this.state = {
         courses: [],
         selected_course: Number(this.props.match.params.id),
         course_assignments: [],
      };

      this.updateSelectedCourse = this.updateSelectedCourse.bind(this);
      this.formatCourseName = this.formatCourseName.bind(this);
      this.getAssignmentsForCourse = this.getAssignmentsForCourse.bind(this);
      this.getCourses = this.getCourses.bind(this);
      this.lockAssignment = this.lockAssignment.bind(this);
   }

   componentDidMount() {
      this.getCourses(this.props.current_user);
   }

   componentWillReceiveProps(new_props) {
      this.getCourses(new_props.current_user);
   }

   getCourses() {
      this.props.models.course.getCoursesForUser()
         .then((result) => {
            let courses_taught = [];
            for (let course of result) {
               const course_role = this.props.models.course.getCoursePrivileges(course.course_role);
               if (course_role.can_modify_course === true) {
                  courses_taught.push(course);
               }
            }
            this.setState({ courses: courses_taught });
         })
         .catch(err => { });
   }

   updateSelectedCourse(evt) {
      this.setState({ selected_course: this.state.courses[evt.target.value] }, () => {
         this.getAssignmentsForCourse();
      });
   }

   formatCourseName(course) {
      return course.name + " - " + course.term + " " + course.year;
   }

   lockAssignment(evt) {
      const index = Number(evt.target.dataset.id);
      const assignment = this.state.assignments_list[index];
      this.props.models.assignment.lockAssignment(assignment.assignment_id);
   }

   getAssignmentsForCourse() {
      this.props.models.course.getActiveAssignmentsForCourse(this.state.selected_course.course_id)
      .then((result) => {
         let assignments_list = [];
         for (let assignment of result) {
            const course_role = this.props.models.course.getCoursePrivileges(this.state.selected_course.course_role);
            if (course_role.can_modify_course === true) {
               assignments_list.push(assignment);
            }
         }
         this.setState({ course_assignments: assignments_list });
      })
      .catch(err => { });
   }

   render() {
      const self = this;
      const headers = ['Assignment', 'Locked'];
      const assignment_headers = ['assignment_name', 'is_locked'];
      const assignment_buttons = [{text: "Lock", click: this.lockAssignment}, {text: "View", click: this.viewAssignment}];
      const current_course = this.state.selected_course.course_id;
      return (
         <article className="container">
            <select value={this.state.selected_course.course_id} onChange={this.updateSelectedCourse}>
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

const Assignments = connect(mapStateToProps)(AssignmentsList);
export { Assignments };
export default Assignments;