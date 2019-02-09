import React, { Component } from 'react';
import { connect } from "react-redux";
import {updateUser} from '../../actions/index';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
 };

 const mapDispatchToProps = dispatch => {
   return {
      updateUser: user => dispatch(updateUser(user))
    };
 };

class LoginView extends Component {

   constructor(props) {
      super(props);

      this.state = {
         email: "",
         password: "",
         invalid_login: false
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
      this.props.models.user.logIn(this.state.email, this.state.password)
         .then((user) => {
            this.props.updateUser(user);
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
            <form className="form-inline mt-sm-2 ml-sm-2 " onSubmit={this.login}>
            <span className="mr-sm-2">Login</span>
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

const Login = connect(mapStateToProps, mapDispatchToProps)(LoginView);
export { Login };
export default Login;