import React, { Component } from 'react';
import { connect } from "react-redux";
import { sortBy } from 'lodash';
import UserList from './../components/UserList'
import EditUser from './EditUser'
import { Link } from 'react-router-dom';
import { link } from 'fs';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class ManageView extends Component {

   constructor(props) {
      super(props);

      this.state = {
         courses: [],
         selected_course: Number(this.props.match.params.id),
         users: []
      };

      this.updateSelectedCourse = this.updateSelectedCourse.bind(this);
      this.formatCourseName = this.formatCourseName.bind(this);
      this.getCourses = this.getCourses.bind(this);
      this.getUsers = this.getUsers.bind(this);
      this.editUser = this.editUser.bind(this);
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
            let all_users = [];

            //filter course users based on access rights
            for (let user of result) {
               const privilege = this.props.models.course.getCoursePrivileges(user.course_role);
               all_users.push(user);
            }
            this.setState({users: all_users });
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

   editUser(evt) {
      const index = Number(evt.target.dataset.id);
      const user = this.state.users[index];
      const user_id = user.id
   }

   renderModifyLink(should_render, user_id) {
      if (should_render === true) {
         return (
            <Link to={"/admin/user/" + user_id} className="btn btn-primary" style={{ color: "#FFFFFF" }}>Manage</Link>
         );
      }
      else {
         return (<span></span>)
      }
   }

   render() {
      const self = this;
      const all_users = this.state.users;
      const headers = ['ID', 'First Name', 'Last Name', 'Email'];
      const user_headers = ['user_id', 'first_name', 'last_name', 'email'];
      const user_id = 1; // how to get current id
      const user_buttons = [{text: <Link to={"/admin/user/" + user_id} className="btn btn-primary" style={{ color: "#FFFFFF" }}>Manage</Link>}];

      return (
         <article className="container">
            <h1>Manage Users</h1>
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
               <h1>Users</h1>
               <UserList header={headers} raw_data={this.state.users} data_cols={user_headers} buttons={user_buttons} />
            </article>
         </article>
      );
   }
}

const Manage = connect(mapStateToProps)(ManageView);
export { Manage };
export default Manage;