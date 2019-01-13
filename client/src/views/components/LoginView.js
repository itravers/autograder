import React, { Component } from 'react';
import Session from '../../view_models/Session.js';
import User from '../../models/User.js';

class LoginView extends Component {

   constructor(props) {
      super(props);

      this.session = Session;
      this.state = {
         email: "",
         password: "",
         invalid_login: false
      };
      this.user_manager = new User(this.props.config);

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
      this.user_manager.logIn(this.state.email, this.state.password)
      .then((user) =>{
         this.props.update_user(user);
      })
      .catch((err) =>{
         this.setState({invalid_login: true});
      });
   }

   render() {
      const user_name = this.state.user_name;
      const password = this.state.password;
      return (
         <article>
            <form onSubmit={this.login}>
               <div className="row">
                  <div className="col-md-1">
                     Email:
                  </div>
                  <div className="col-md-3">
                     <input type="text" id="UserNameTextBox" name="email" value={user_name} onChange={this.handleInputChange} />
                  </div>

                  <div className="col-md-2">
                     Password:
                  </div>
                  <div className="col-md-3">
                     <input type="password" id="PasswordTextBox" name="password" value={password} onChange={this.handleInputChange} />
                  </div>
                  <div className="col-md-2">
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