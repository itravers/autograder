import React, { Component } from 'react';
import { connect } from "react-redux";
import { updateUser } from '../../actions/index';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';
import './index.css';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class ManageView extends Component {

   constructor(props) {
      super(props);

      this.state = {
         courses: [],
         selected_course: Number(this.props.match.params.id)
      };

      this.updateSelectedCourse = this.updateSelectedCourse.bind(this);
      this.formatCourseName = this.formatCourseName.bind(this);
      this.getCourses = this.getCourses.bind(this);
   }

   componentDidMount(){
      this.getCourses(this.props.current_user);
   }

   componentWillReceiveProps(new_props) {
      this.getCourses(new_props.current_user);
   }

   getCourses(current_user){
      this.props.models.course.getCoursesForUser(current_user.id)
         .then((result) => {
            let courses_taught = [];
            for(let course of result){
               const course_role = this.props.models.course.getCoursePrivileges(course.course_role);
               if(course_role.can_modify_course === true){
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

   render() {
      const self = this;

      return (
         <article className="container">
            <h1>Manage My Courses</h1>
                  <select value={this.state.selected_course.course_id} onChange={this.updateSelectedCourse}>
                     {this.state.courses.map((value, index) =>
                        <option
                           key={index}
                           value={value.course_id}>
                           {this.formatCourseName(value)}
                        </option>
                     )}
                  </select>
         </article>
      );
   }
}

const Manage = connect(mapStateToProps)(ManageView);
export { Manage };
export default Manage;