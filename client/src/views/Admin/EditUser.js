import React, { Component } from 'react';
import { connect } from "react-redux";
import { sortBy } from 'lodash';
import UserList from './../components/UserList'
import editUser from './EditUser'
import { Link } from 'react-router-dom';
import User from '../../models/User';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class EditView extends Component {

   constructor(props) {
      super(props);

      this.state = {
        users: [],
        selected_user: Number(this.props.match.params.id),
        user: User
      };

      this.getCourses = this.getCourses.bind(this);
      this.getUsers = this.getUsers.bind(this);
      this.getUserInfo = this.getUserInfo.bind(this);
   }

   componentDidMount() {
    this.getCourses(this.props.current_user);
    this.getUsers();
    this.getUserInfo();
    }

    componentWillReceiveProps(new_props) {
        this.getCourses(new_props.current_user);
        this.getUsers();
        this.getUserInfo();
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
             all_users.push(user);
          }
          this.setState({users: all_users });
       })
       .catch(err => { });
   }
   getUserInfo() {
      for (let this_user of this.state.users) {
         if (this_user.id === this.state.selected_user)
         {
            this.setState({user: this_user});
         }
      }
   }


   render() {
    const self = this;
    const user_id = this.state.selected_user;
    const this_user = this.state.user;
    const name = this_user.first_name + " " + this_user.last_name;
    return (
       <article className="container">
          <h1>Manage User</h1>
          <h4>{user_id}</h4>
          <h4>{name}</h4>
       </article>
    );
 }
}

const EditUser = connect(mapStateToProps)(EditView);
export { EditUser };
export default EditUser;