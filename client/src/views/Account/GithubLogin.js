import React, { Component } from 'react';
import { connect } from "react-redux";
import {updateUser} from '../../actions/index';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';
import {axios} from 'axios';
//include '../../oauthconfig.json';



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
           password: "",
           invalid_login: false,
           redirect_path: "https://github.com/login/oauth/authorize?client_id=" + {client_id_temp}
        };
        
     }
     
    render() {
    
      const query = window.location.search.substring(1);
      const token = query.split('access_token=')[1];
      const email_val = "";

      const axios = require('axios');
      axios({
         method: 'get',
         url: '//api.github.com/user',
         headers: {
            Authorization: 'token ' + token
         }

      })
      //.then(res=> res.json())
      .then(res=> {
         this.state.email = res.email
         email_val = res.email
         console.log(res.email)
      });
      /*
      fetch('//api.github.com/user', {
         headers: {
            Authorization: 'token ' + token,
            //'Access-Control-Allow-Origin': 'http://localhost:3000'

            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token'
         }
      })
      .then(res=> res.json())
      .then(res=> {
         this.state.email = res.email
         email_val = res.email
         console.log(res.email)
      })
      */


      return(<a href = {this.state.redirect_path}> Login with Github </a>);
  }
}
  
  const GithubLogin = connect(mapStateToProps, mapDispatchToProps)(GithubLoginView);
  export { GithubLogin };
  export default GithubLogin;