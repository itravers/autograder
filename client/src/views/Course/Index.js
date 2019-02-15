import React, { Component } from 'react';
import { connect } from "react-redux";
import { updateUser } from '../../actions/index';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';
import './index.css';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

const mapDispatchToProps = dispatch => {
   return {
      updateUser: user => dispatch(updateUser(user))
   };
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
   }

   componentDidMount() {
      this.getCourses();
   }

   courseButtonClick(evt) {

      const button_id = evt.target.dataset.id;
      if (this.state.enrolled_courses[button_id] === undefined) {
         //add request
         this.props.models.course.addUser(button_id, this.props.current_user.id)
         .then(() => {
            let enrolled_courses = {...this.state.enrolled_courses};
            enrolled_courses[button_id] = {id: button_id};
            this.setState({enrolled_courses: enrolled_courses});
         })
         .catch((err) => {});
      }
      else {
         //remove request
         this.props.models.course.removeUser(button_id, this.props.current_user.id)
         .then(() => {
            let enrolled_courses = {...this.state.enrolled_courses};
            delete enrolled_courses[button_id];
            this.setState({enrolled_courses: enrolled_courses});
         })
         .catch((err) => {});
      }
   }

   //will load enrolled courses then all courses for the user
   getCourses() {
      this.props.models.course.getCoursesForUser(this.props.current_user.id)
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

   render() {
      const all_courses = this.state.all_courses;
      const enrolled_courses = this.state.enrolled_courses;
      const self = this;
      return (
         <article className="container">
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
                  {all_courses.map((value, index) => {
                     let button_text = "Add";
                     if (enrolled_courses[value.id] !== undefined) {
                        button_text = "Remove";
                     }
                     return (
                        <tr key={value.id}>
                           <td>
                              <button data-id={value.id} onClick={self.courseButtonClick}>{button_text}</button>
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
      );
   }
}

const Index = connect(mapStateToProps, mapDispatchToProps)(IndexView);
export { Index };
export default Index;