import React, { Component } from 'react';
import LoginView from './components/LoginView.js';
import CourseAssignmentSelector from './components/CourseAssignmentSelector.js';

class UserSessionView extends Component{

   constructor(props){
      super(props);

      this.state = {
         is_logged_in: false,
         user: {},
         courses: {},
         assignments: {}
      };

      this.user_model = this.props.user_model;

      this.updateUser = this.updateUser.bind(this);
   }

   componentDidMount(){

      //are we already logged in?  If so, skip login screen.
      this.user_model.currentUser().then(user => {
         if(user.id > 0){
            this.updateUser(user);
         }
      }); 
      
   }

   updateUser(user){
      if(user.id !== undefined){
         this.setState({is_logged_in: true, user: user}, () =>{
            this.props.onUserChange(this.state.user);
         });
      }
   }

   render(){
      if(this.state.is_logged_in === false){
         return(
            <LoginView config={this.props.config} update_user={this.updateUser}  />
         );
      }
      return(
         <CourseAssignmentSelector 
         config={this.props.config} 
         user={this.state.user} 
         onAssignmentChange={this.props.onAssignmentChange} />
      );
   }
}

export {UserSessionView};
export default UserSessionView;