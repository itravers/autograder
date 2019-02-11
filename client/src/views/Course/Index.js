import React, { Component } from 'react';
import { connect } from "react-redux";
import { updateUser } from '../../actions/index';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';

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

      this.getAllCourses = this.getAllCourses.bind(this);
      this.getSelectedCourses = this.getSelectedCourses.bind(this);
   }

   componentDidMount(){
      this.getAllCourses();
      this.getSelectedCourses();
   }

   getAllCourses(){
      this.props.models.course.all()
      .then((result) => this.setState({all_courses: result}))
      .catch((err) => {});
   }

   getSelectedCourses(){
      this.props.models.course.getCoursesForUser(this.props.current_user.id)
         .then((courses) => {
            this.setState({ enrolled_courses: courses}, () => {
               this.getAssignmentsForCourse();
            });
         })
         .catch((err) => { });
   }

   render() {
      return (
         <article>
            <h1>Available Courses</h1>
            <ul>
               {this.state.all_courses.map((value, index) => 
                  <li key={value.id}>{value.name}</li>
               )}
            </ul>
         </article>
      );
   }
}

const Index = connect(mapStateToProps, mapDispatchToProps)(IndexView);
export { Index };
export default Index;