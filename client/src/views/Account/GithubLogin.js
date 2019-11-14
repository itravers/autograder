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
           invalid_login: false,
           redirect_path: "https://github.com/login/oauth/authorize?client_id=" + oauthconfig.client_id + "&redirect_uri=http://localhost:8080/oauth/redirect"
        };
        //this.login = this.login.bind(this);
        
     }

     /*login() {
      
      this.props.models.user.currentUser()
         .then((user) => {
            if (this.props.current_user.id !== undefined && this.props.current_user.id > 0)
            {
               return this.props.updateUser(user);
            }
            else{
               
            }  
         })
         .catch((err) => {
            this.setState({ invalid_login: true });
         });
   }
     */
    render() {

      if(this.props.current_user.id !== undefined && this.props.current_user.id > 0)
      {

         this.props.models.user.currentUser()
         .then((user) => {
            if (this.props.current_user.id !== undefined && this.props.current_user.id > 0)
            {
               this.props.updateUser(user);
               return(<Redirect to="/assignment" />);
            }})
      }
      else
      {
         return(<a href = {this.state.redirect_path}> Login with Github </a>);

      }
      
  }
}
  
  const GithubLogin = connect(mapStateToProps, mapDispatchToProps)(GithubLoginView);
  export { GithubLogin };
  export default GithubLogin;