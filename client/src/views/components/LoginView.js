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
         .then((user) => {
            this.props.update_user(user);
         })
         .catch((err) => {
            this.setState({ invalid_login: true });
         });
   }

   render() {
      const user_name = this.state.user_name;
      const password = this.state.password;
      return (
         <article>
            <form className="form-inline mt-sm-2 ml-sm-2" onSubmit={this.login}>
            <span className="mr-sm-2">Login:</span>
               <div className="form-group">
                  <label className="sr-only" htmlFor="UserNameTextBox">
                     Email:
                  </label>
                  <input 
                     type="text" 
                     className="form-control mb-2 mr-sm-2" 
                     id="UserNameTextBox" 
                     name="email" 
                     value={user_name} 
                     onChange={this.handleInputChange}
                     placeholder="Email Address"
                      />
                  <label className="sr-only" htmlFor="PasswordTextBox">Password:</label>
                  <input 
                     type="password" 
                     className="form-control mb-2 mr-sm-2" 
                     id="PasswordTextBox" 
                     name="password" 
                     value={password} 
                     onChange={this.handleInputChange} 
                     placeholder="password"
                     />
               </div>
               <button id="SubmitButton" className="btn btn-outline-primary mb-2 mr-sm-2" type="submit">Log In</button>
            </form>
         </article>
      );
   }
}

export { LoginView };
export default LoginView;