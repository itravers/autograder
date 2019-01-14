import React, { Component } from 'react';
import Course from '../../models/Course.js';

class CourseAssignmentSelector extends Component {

   constructor(props) {
      super(props);
      this.state = {
         courses: [],
         assignments: [],
         selected_course: {},
         selected_assignment: {}
      };
      this.config = this.props.config;
      this.user = this.props.user;
      this.course_manager = new Course(this.config, true);

      this.getAssignmentsForCourse = this.getAssignmentsForCourse.bind(this);
      this.updateSelectedAssignment = this.updateSelectedAssignment.bind(this);
      this.updateSelectedCourse = this.updateSelectedCourse.bind(this);
      this.formatCourseName = this.formatCourseName.bind(this);
   }

   componentDidMount() {
      this.course_manager.getCoursesForUser(this.user.id)
         .then((courses) => {
            this.setState({ courses: courses, selected_course: courses[0] }, () => {
               this.getAssignmentsForCourse();
            });
         })
         .catch((err) => { });
   }

   getAssignmentsForCourse() {
      this.course_manager.getActiveAssignmentsForCourse(this.state.selected_course.course_id)
         .then((assignments) => {
            this.setState({ assignments: assignments, selected_assignment: assignments[0] }, () => {
               this.props.onAssignmentChange(this.state.selected_assignment);
            });
         })
         .catch((err) => { });;
   }

   updateSelectedCourse(evt) {
      this.setState({ selected_course: this.state.courses[evt.target.value] }, () => {
         this.getAssignmentsForCourse();
      });
   }

   updateSelectedAssignment(evt) {
      this.setState({ selected_assignment: this.state.assignments[evt.target.value] }, () => {
         this.props.onAssignmentChange(this.state.selected_assignment);
      });
   }

   formatCourseName(course) {
      return course.name + " - " + course.term + " " + course.year;
   }

   render() {
      return (
         <article>
            <div className="row">
               <div className="col">
                  Course:
                  <select value={this.state.selected_course.course_id} onChange={this.updateSelectedCourse}>
                     {this.state.courses.map((value, index) =>
                        <option
                           key={index}
                           value={value.course_id}>
                           {this.formatCourseName(value)}
                        </option>
                     )}
                  </select>
               </div>
               <div className="col">
                  Assignment:
                  <select value={this.state.selected_assignment.id} onChange={this.updateSelectedAssignment}>
                     {this.state.assignments.map((value, index) =>
                        <option
                           key={value.id}
                           value={index}>
                           {value.name}
                        </option>
                     )}
                  </select>
               </div>
            </div>
         </article>
      );
   }
}

export { CourseAssignmentSelector };
export default CourseAssignmentSelector;