import React, { Component } from 'react';
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';
import UserList from './../components/UserList'


const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class ManageView extends Component {

   constructor(props) {
      super(props);

      this.state = {
         courses: [],
         selected_course: Number(this.props.match.params.id),
         course_tas: [],
         users_pending: [],
         users_active: []
      };

      this.updateSelectedCourse = this.updateSelectedCourse.bind(this);
      this.formatCourseName = this.formatCourseName.bind(this);
      this.getCourses = this.getCourses.bind(this);
      this.getUsers = this.getUsers.bind(this);
   }

   componentDidMount() {
      this.getCourses(this.props.current_user);
      this.getUsers();
   }

   componentWillReceiveProps(new_props) {
      this.getCourses(new_props.current_user);
      this.getUsers();
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

   getUsers() {
      this.props.models.course.getCourseUsers(this.state.selected_course)
         .then((result) => {
            let tas = [];
            let active_users = [];
            let pending_users = [];

            //filter course users based on access rights
            for(let user of result){
               const privilege = this.props.models.course.getCoursePrivileges(user.course_role);
               if(privilege.can_grade_assignment === true){
                  tas.push(user);
               }
               else if(privilege.can_submit_assignment === true){
                  active_users.push(user);
               }
               else{
                  pending_users.push(user);
               }
            }
            this.setState({ course_tas: tas, users_pending: pending_users, users_active: active_users });
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
      const headers = ['First Name', 'Last Name', 'Email'];
      const student_headers = ['first_name', 'last_name', 'email'];

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
            <article>
               <h1>TAs</h1>
               <UserList header={headers} raw_data={this.state.course_tas} data_cols={student_headers} />
            </article>
            <article>
               <h1>Approved Students</h1>
               <UserList header={headers} raw_data={this.state.users_active} data_cols={student_headers} />
            </article>
            <article>
               <h1>Pending Students</h1>
               <UserList header={headers} raw_data={this.state.users_pending} data_cols={student_headers} />
            </article>
         </article>
      );
   }
}

const Manage = connect(mapStateToProps)(ManageView);
export { Manage };
export default Manage;