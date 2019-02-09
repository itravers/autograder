import React, { Component } from 'react';
import Session from '../../view_models/Session.js';
import User from '../../models/User.js';
import { connect } from "react-redux";
import { updateUser } from '../../actions/index';
import './Create.css';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

const mapDispatchToProps = dispatch => {
   return {
      updateUser: user => dispatch(updateUser(user))
   };
};

class CreateView extends Component {

   constructor(props) {
      super(props);

      this.session = Session;
      this.state = {
         email: "",
         password: "",
         first_name: "",
         last_name: "",
         error_messages: ""
      };
      this.user_manager = new User(this.props.config);
      this.createAccount = this.createAccount.bind(this);
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

   createAccount(evt) {
      evt.preventDefault();
      this.props.models.user.create(this.state)
         .then((user) => {
            this.props.updateUser(user);
         })
         .catch((err) => {
            this.setState({ error_messages: err });
         });
   }

   render() {
      const user_name = this.state.user_name;
      const password = this.state.password;
      const last_name = this.state.last_name;
      const first_name = this.state.first_name;
      return (
         <article className="container">
            <h1>Create an Account</h1>
            <form className="" onSubmit={this.createAccount}>
               <div className="form-group">
                  <label htmlFor="FirstNameTextBox">First Name</label>
                  <input
                     type="text"
                     className="form-control"
                     id="FirstNameTextBox"
                     name="first_name"
                     value={first_name}
                     onChange={this.handleInputChange}
                     placeholder=""
                  />
               </div>
               <div className="form-group">
                  <label htmlFor="LastNameTextBox">Last Name</label>
                  <input
                     type="text"
                     className="form-control"
                     id="LastNameTextBox"
                     name="last_name"
                     value={last_name}
                     onChange={this.handleInputChange}
                     placeholder=""
                  />
               </div>
               <div className="form-group">
                  <label htmlFor="UserNameTextBox">
                     Email
                  </label>
                  <input
                     type="text"
                     className="form-control"
                     id="UserNameTextBox"
                     name="email"
                     value={user_name}
                     onChange={this.handleInputChange}
                     placeholder=""
                  />
               </div>
               <div className="form-group">
                  <label htmlFor="PasswordTextBox">Password</label>
                  <input
                     type="password"
                     className="form-control"
                     id="PasswordTextBox"
                     name="password"
                     value={password}
                     onChange={this.handleInputChange}
                     placeholder=""
                  />
               </div>
               <button id="SubmitButton" className="btn btn-outline-primary" type="submit">Create Account</button>
            </form>
         </article >
      );
   }
}

const Create = connect(mapStateToProps, mapDispatchToProps)(CreateView);
export { Create };
export default Create;