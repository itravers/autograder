import React, { Component } from 'react';
import { connect } from "react-redux";
import './index.css';
import { Link } from 'react-router-dom';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class IndexView extends Component {

   constructor(props) {
      super(props);

      this.state = {
         all_courses: [],
         enrolled_courses: {}
      };

      this.getCourses = this.getCourses.bind(this);
      this.courseButtonClick = this.courseButtonClick.bind(this);
      this.renderModifyLink = this.renderModifyLink.bind(this);
      this.renderAssignmentsLink = this.renderAssignmentsLink.bind(this);
   }

   componentDidMount() {
      this.getCourses(this.props.current_user.id);
   }

   componentWillReceiveProps(new_props) {
      this.getCourses(new_props.current_user.id);
   }

   courseButtonClick(evt) {

      const button_id = evt.target.dataset.id;
      if (this.state.enrolled_courses[button_id] === undefined) {
         //add request
         this.props.models.course.addUser(button_id, this.props.current_user.id)
            .then(() => {
               let enrolled_courses = { ...this.state.enrolled_courses };
               enrolled_courses[button_id] = { id: button_id };
               this.setState({ enrolled_courses: enrolled_courses });
            })
            .catch((err) => { });
      }
      else {
         //remove request
         this.props.models.course.removeUser(button_id, this.props.current_user.id)
            .then(() => {
               let enrolled_courses = { ...this.state.enrolled_courses };
               delete enrolled_courses[button_id];
               this.setState({ enrolled_courses: enrolled_courses });
            })
            .catch((err) => { });
      }
   }

   //will load enrolled courses then all courses for the user
   getCourses(user_id) {
      this.props.models.course.getCoursesForUser(user_id)
         .then(result => {
            let courses = {};
            for (let course of result) {
               courses[course.id] = course;
            }
            return new Promise(resolve => this.setState({ enrolled_courses: courses }, resolve));
         })
         .then(() => this.props.models.course.all())
         .then(result => this.setState({ all_courses: result }))
         .catch((err) => { });
   }

   renderModifyLink(should_render, course_id) {
      if (should_render === true) {
         return (
            <Link to={"/course/" + course_id + "/manage"} className="btn btn-primary" style={{ color: "#FFFFFF" }}>Manage</Link>
         );
      }
      else {
         return (<span></span>)
      }
   }

   renderAssignmentsLink(should_render, course_id) {
      if (should_render === true) {
         return (
            <Link to={"/course/" + course_id + "/assignments/"} className="btn btn-primary" style={{ color: "#FFFFFF" }}>Assignments</Link>
         );
      }
      else {
         return (<span></span>)
      }
   }

   render() {
      const all_courses = this.state.all_courses;
      const enrolled_courses = this.state.enrolled_courses;
      const self = this;
      return (
         <article className="container">
            <article>
               <h1>My Courses</h1>
               <table className="table table-striped text-left">
                  <thead>
                     <tr>
                        <th scope="col"></th>
                        <th scope="col">Course Name</th>
                        <th scope="col">School</th>
                        <th scope="col">Year</th>
                        <th scope="col">Term</th>
                     </tr>
                  </thead>
                  <tbody>
                     {all_courses.reduce((result, course) => {
                        if (enrolled_courses[course.id] !== undefined) {
                           result.push(course)
                        }
                        return result;
                     }, []).map((value, index) => {
                        const course_roles = self.props.models.course.getCoursePrivileges(enrolled_courses[value.id].course_role);
                        const user_roles = {
                           is_instructor: Boolean(self.props.current_user.is_instructor),
                           is_admin: Boolean(self.props.current_user.is_admin), 
                           is_account_pending: Boolean(self.props.current_user.is_account_pending)
                        };
                        const is_instructor = course_roles.can_modify_course && (user_roles.is_instructor || user_roles.is_admin) && !user_roles.is_account_pending;
                        const is_grader = course_roles.can_grade_assignment && !user_roles.is_account_pending; 
                        const can_submit = course_roles.can_submit_assignment && !user_roles.is_account_pending;
                        return (
                           <tr key={value.id}>
                              <td>
                                 <button className="btn btn-primary" data-id={value.id} onClick={self.courseButtonClick}>Remove</button>
                                 &nbsp;
                                 {this.renderModifyLink(is_instructor, value.id)}
                                 &nbsp;
                                 {this.renderAssignmentsLink((can_submit || is_grader || is_instructor), value.id)}
                              </td>
                              <td>
                                 {value.name}
                              </td>
                              <td>
                                 {value.acronym}
                              </td>
                              <td>
                                 {value.year}
                              </td>
                              <td>
                                 {value.term}
                              </td>
                           </tr>
                        )
                     }
                     )}
                  </tbody>
               </table>
            </article>
            <article>
               <h1>Available Courses</h1>
               <table className="table table-striped">
                  <thead>
                     <tr>
                        <th scope="col"></th>
                        <th scope="col">Course Name</th>
                        <th scope="col">School</th>
                        <th scope="col">Year</th>
                        <th scope="col">Term</th>
                     </tr>
                  </thead>
                  <tbody>
                     {all_courses.reduce((result, course) => {
                        if (enrolled_courses[course.id] === undefined) {
                           result.push(course)
                        }
                        return result;
                     }, []).map((value, index) => {
                        return (
                           <tr key={value.id}>
                              <td>
                                 <button className="btn btn-primary" data-id={value.id} onClick={self.courseButtonClick}>Add</button>
                              </td>
                              <td>
                                 {value.name}
                              </td>
                              <td>
                                 {value.acronym}
                              </td>
                              <td>
                                 {value.year}
                              </td>
                              <td>
                                 {value.term}
                              </td>
                           </tr>
                        )
                     }
                     )}
                  </tbody>
               </table>
            </article>
         </article>
      );
   }
}

const Index = connect(mapStateToProps)(IndexView);
export { Index };
export default Index;