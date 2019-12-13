import React, { Component } from 'react';
import { connect } from "react-redux";
import {updateUser} from '../../actions/index';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';
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
           email: "",
           invalid_login: true,
           redirect_path: "https://github.com/login/oauth/authorize?client_id=" + oauthconfig.client_id + "&redirect_uri=http://localhost:8080/api/user/oauth/"
        };
     }

   componentDidMount(){
      this.props.models.user.currentUser()
         .then((user) => {
            if (user.id !== undefined && user.id > 0)
            {
               this.props.updateUser(user);
               this.setState({invalid_login: false}); 
            }
         })
         .catch(() => {
            this.setState({ invalid_login: true });
         });
   }

   // prompts user to log in with GitHub if not already logged in.
   // redirects to user's course page otherwise 
   loginPage(invalid_login)
   {
    if(invalid_login == false)
      {
         return(<Redirect to="/course" />);
      }
      else
      {
         return(<a href= {this.state.redirect_path} className = "btn btn-primary"> Login with Github </a>);
      }
   }

   render() {
      const invalid_login = this.state.invalid_login; 
      return(this.loginPage(invalid_login)); 
   }
}
  
  const GithubLogin = connect(mapStateToProps, mapDispatchToProps)(GithubLoginView);
  export { GithubLogin };
  export default GithubLogin;