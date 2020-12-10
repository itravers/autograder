import React, { Component } from 'react';
import { connect } from "react-redux";
import {updateUser} from '../../actions/index';
import { Redirect } from 'react-router-dom';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
 };

 const mapDispatchToProps = dispatch => {
   return {
      updateUser: user => dispatch(updateUser(user))
    };
 };

class LogoutView extends Component {

   componentDidMount(){
      this.props.models.user.logOut()
      .then(() => this.props.updateUser({id: -1}))
      .catch();
   }

   render() {
      if(this.props.current_user.id !== undefined && this.props.current_user.id < 0)
      {
         return(<Redirect to="/account/login" />);
      }
      return (
         <article>
            Logging out...
         </article>
      );
   }
}

const Logout = connect(mapStateToProps, mapDispatchToProps)(LogoutView);
export { Logout };
export default Logout;