import React, { Component } from 'react';
import { connect } from "react-redux";
import {updateUser} from '../../actions/index';
import {Redirect} from 'react-router-dom';
var oauthconfig = require('../../oauthconfig.json');


const mapStateToProps = state => {
    return { current_user: state.current_user, models: state.models };
  };
 
  const mapDispatchToProps = dispatch => {
    return {
       updateUser: user => dispatch(updateUser(user))
     };
  };

class GithubLoginView extends Component {

  constructor(props) {
        super(props);

        this.state = {
           has_courses: false, 
           valid_login: false, 
           redirect_path: "https://github.com/login/oauth/authorize?client_id=" + oauthconfig.client_id + "&redirect_uri=http://localhost:8080/api/user/oauth/"
        };
     }

   componentDidMount(){
      this.props.models.user.currentUser()
         .then((user) => {
            if (user.id !== undefined && user.id > 0)
            {
               this.props.updateUser(user); 
            }
            else
            {
               this.setState({valid_login: false});
               return Promise.reject('no user logged in'); 
            }
         })
         .then(() => this.props.models.course.getCoursesForUser(this.props.current_user.id))
         .then((courses) => {
            if (courses && courses.length)
            {
               // user is enrolled in courses 
               this.setState({has_courses: true}); 
            }
            else
            {
               this.setState({has_courses: false}); 
            }
         })
         .then(() => {
            // done updating state, ready for login 
            this.setState({valid_login: true}); 
         })
         .catch(() => {
            this.setState({valid_login: false}); 
         });
   }

   render() {
      // generate appropriate page based on whether a user is logged in-- 
      // show login button if not already logged in, or show the user's 
      // course/assignment page once logged in 
      if(this.state.valid_login === true) 
      {
         if(this.state.has_courses === true) 
         {
            // user has a course, so redirect to assignment page
            return(<Redirect to="/assignment" />);
         }
         else
         {
            // user not enrolled in any courses-- let them choose one first 
            return(<Redirect to="/course" />);
         }
      }
      else
      {
         return(<a href= {this.state.redirect_path} className = "btn btn-primary"> Login with Github </a>);
      }
   }
}
  
  const GithubLogin = connect(mapStateToProps, mapDispatchToProps)(GithubLoginView);
  export { GithubLogin };
  export default GithubLogin;