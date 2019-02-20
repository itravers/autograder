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

class ManageView extends Component {

   constructor(props) {
      super(props);

      this.state = {
         courses: [],
      };
   }

   componentDidMount() {
      this.props.models.course.getCoursesForUser(this.props.current_user.id)
         .then((result) => {
            let courses_taught = [];
            for(let course of result){
               if(course.course_role === 1){
                  courses_taught.push(course);
               }
            }
            this.setState({ courses: courses_taught });
         })
         .catch(err => { });
   }

   render() {
      const self = this;

      return (
         <article className="container">
            <h1>Manage Course Enrollment</h1>
         </article>
      );
   }
}

const Manage = connect(mapStateToProps, mapDispatchToProps)(ManageView);
export { Manage };
export default Manage;