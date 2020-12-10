import React, { Component } from 'react';
import { connect } from "react-redux";
import { sortBy } from 'lodash';
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
      this.addTa = this.addTa.bind(this);
      this.removeTa = this.removeTa.bind(this);
      this.approveStudent = this.approveStudent.bind(this);
      this.unapproveStudent = this.unapproveStudent.bind(this); 
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
            for (let user of result) {
               const privilege = this.props.models.course.getCoursePrivileges(user.course_role);
               if (privilege.can_grade_assignment === true) {
                  tas.push(user);
               }
               else if (privilege.can_submit_assignment === true) {
                  active_users.push(user);
               }
               else if(privilege.is_pending === true){
                  pending_users.push(user);
               }
            }
            this.setState({ course_tas: tas, users_pending: pending_users, users_active: active_users });
         })
         .catch(err => { });
   }

   updateSelectedCourse(evt) {
      this.setState({ selected_course: this.state.courses[evt.target.selectedIndex].id }, this.getUsers);
      this.props.history.push(`/course/${evt.target.value}/manage`);
   }

   formatCourseName(course) {
      return course.name + " - " + course.term + " " + course.year;
   }

   addTa(evt){
      const course = this.props.models.course;
      const index = Number(evt.target.dataset.id);
      const student = this.state.users_active[index];
      let privilege = course.getCoursePrivileges(student.course_role);
      privilege[course.PRIVILEGES.can_grade_assignment] = true;
      const privilege_number = course.getCoursePrivilegeNumber(privilege);
      course.setCourseRole(this.state.selected_course, student.user_id, privilege_number)
      .then( () => {
         let ta_list = [...this.state.course_tas];
         let active_users = [...this.state.users_active];
         active_users.splice(index, 1);
         ta_list.push(student);
         ta_list = sortBy(ta_list, ['last_name', 'first_name']);
         this.setState({course_tas: ta_list, users_active: active_users});
      } )
      .catch( () => {});
   }
   removeTa(evt){
      const course = this.props.models.course;
      const index = Number(evt.target.dataset.id);
      const ta = this.state.course_tas[index];
      let privilege = course.getCoursePrivileges(ta.course_role);
      privilege[course.PRIVILEGES.can_grade_assignment] = false;
      const privilege_number = course.getCoursePrivilegeNumber(privilege);
      course.setCourseRole(this.state.selected_course, ta.user_id, privilege_number)
      .then( () => {
         let ta_list = [...this.state.course_tas];
         let active_users = [...this.state.users_active];
         active_users.push(ta);
         ta_list.splice(index, 1);
         active_users = sortBy(active_users, ['last_name', 'first_name']);
         this.setState({course_tas: ta_list, users_active: active_users});
      } )
      .catch( () => {});
   }

   unapproveStudent(evt){
      const course = this.props.models.course;
      const index = Number(evt.target.dataset.id);
      const student = this.state.users_active[index];
      let privilege = course.getCoursePrivileges(student.course_role);
      privilege[course.PRIVILEGES.can_submit_assignment] = false;
      const privilege_number = course.getCoursePrivilegeNumber(privilege);
      course.setCourseRole(this.state.selected_course, student.user_id, privilege_number)
      .then( () => {
         let users_active = [...this.state.users_active];
         let pending_users = [...this.state.users_pending];
         pending_users.push(student);
         users_active.splice(index, 1);
         pending_users = sortBy(pending_users, ['last_name', 'first_name']);
         this.setState({users_active: users_active, users_pending: pending_users});
      } )
      .catch( () => {});
   }

   approveStudent(evt){
      const course = this.props.models.course;
      const index = Number(evt.target.dataset.id);
      const student = this.state.users_pending[index];
      let privilege = course.getCoursePrivileges(student.course_role);
      privilege[course.PRIVILEGES.can_submit_assignment] = true;
      const privilege_number = course.getCoursePrivilegeNumber(privilege);
      course.setCourseRole(this.state.selected_course, student.user_id, privilege_number)
      .then( () => {
         let users_active = [...this.state.users_active];
         let pending_students = [...this.state.users_pending];
         pending_students.splice(index, 1);
         users_active.push(student);
         users_active = sortBy(users_active, ['last_name', 'first_name']);
         this.setState({users_active: users_active, users_pending: pending_students});
      } )
      .catch( () => {});
   }

   render() {
      //const headers = ['First Name', 'Last Name', 'Email'];
      //const student_headers = ['first_name', 'last_name', 'email'];
      const headers = ['Name', 'Login'];
      const student_headers = ['name', 'login']; 
      const ta_buttons = [{text: "Remove", click: this.removeTa}];
      const student_buttons = [{text: "Make TA", click: this.addTa}, {text: "Unapprove", click: this.unapproveStudent}];
      const pending_buttons = [{text: "Approve", click: this.approveStudent}];
      return (
         <article className="container">
            <h1>Manage My Courses</h1>
            <select value={this.state.selected_course} onChange={this.updateSelectedCourse}>
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
               <UserList header={headers} raw_data={this.state.course_tas} data_cols={student_headers} buttons={ta_buttons} />
            </article>
            <article>
               <h1>Approved Students</h1>
               <UserList header={headers} raw_data={this.state.users_active} data_cols={student_headers} buttons={student_buttons}/>
            </article>
            <article>
               <h1>Pending Students</h1>
               <UserList header={headers} raw_data={this.state.users_pending} data_cols={student_headers} buttons={pending_buttons} />
            </article>
         </article>
      );
   }
}

const Manage = connect(mapStateToProps)(ManageView);
export { Manage };
export default Manage;