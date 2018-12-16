import React, { Component } from 'react';
import Session from '../view_models/Session.js';
import User from '../view_models/User.js';
import WebRequest from '../view_models/WebRequest.js';

class LoginView extends Component {

   constructor(props) {
      super(props);

      this.session = Session;
      this.state = {
         email: "",
         password: ""
      };

      this.login = this.login.bind(this);
      this.handleInputChange = this.handleInputChange.bind(this);
   }

   handleInputChange(event) {
      const target = event.target;
      const value = target.type === 'checkbox' ? target.checked : target.value;
      const name = target.name;
  
      this.setState({
        [name]: value
      });
    }

   login(evt) {
      evt.preventDefault();
      let user = new User();
      user.email = this.state.email;
      user.password = this.state.password;
      WebRequest.makePost(this.props.server_endpoint, user, (result) => {
         this.props.update_user(result)
      });
   }

   render() {
      const user_name = this.state.user_name;
      const password = this.state.password;
      return (
         <article>
            <form onSubmit={this.login}>
               <h1>Log In</h1>
               <div className="row align-items-center">
                  <div className="col">
                     Email:
               </div>
                  <div className="col">
                     <input type="text" id="UserNameTextBox" name="email" value={user_name} onChange={this.handleInputChange} />
                  </div>
               </div>
               <div className="row align-items-center">
                  <div className="col">
                     Password:
               </div>
                  <div className="col">
                     <input type="password" id="PasswordTextBox" name="password" value={password} onChange={this.handleInputChange} />
                  </div>
               </div>
               <div className="row align-items-center">
                  <div className="col">
                     <button id="SubmitButton" type="submit">Log In</button>
                  </div>
               </div>
            </form>
         </article>
      );
   }
}

export { LoginView };
export default LoginView;