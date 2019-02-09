import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';
import { connect } from "react-redux";

const mapStateToProps = state => {
   return { current_user: state.current_user };
};

class HeaderView extends Component {

   constructor(props) {
      super(props);
      this.AccountLinks = this.AccountLinks.bind(this);
      this.AssignmentLink = this.AssignmentLink.bind(this);
   }

   AssignmentLink(){
      if(this.props.current_user.id > 0){
         return(
            <Link to="/assignment" className="dropdown-item nav-link">Assignments</Link>
         );
      }
      else{
         return(
            <div>
         </div>
         );
      }
   }

   AccountLinks(){
      if(this.props.current_user.id > 0){
         return(
            <Link to="/account/logout" className="dropdown-item">Logout</Link>
         );
      }
      else{
         return(
            <div>
            <Link to="/account/login" className="dropdown-item">Login</Link>
            <Link to="/account/create" className="dropdown-item">Create</Link>
         </div>
         );
      }
   }

   render() {
      return (
         <div>
            <nav className="navbar navbar-expand-lg fixed-top navbar-light bg-light">
               <Link to="/" className="navbar-brand">Assisted Grader</Link>
               <button
                  className="navbar-toggler"
                  type="button"
                  data-toggle="collapse"
                  data-target="#navbarNav"
                  aria-controls="navbarSupportedContent"
                  aria-expanded="false"
                  aria-label="Toggle navigation"
               >
                  <span className="navbar-toggler-icon"></span>
               </button>
               <div className="collapse navbar-collapse" id="navbarNav">
                  <ul className="navbar-nav ml-auto">
                     <li className="nav-item">
                        <Link to="/" className="nav-link">Home</Link>
                     </li>
                     <li className="nav-item">
                        <this.AssignmentLink />
                     </li>
                     <li className="nav-item dropdown">
                        <a className="nav-link dropdown-toggle"
                           href="#top" id="navbarDropdown"
                           role="button"
                           data-toggle="dropdown"
                           aria-haspopup="true"
                           aria-expanded="false">
                           Account
                           </a>
                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="navbarDropdown">
                           <this.AccountLinks />
                        </div>
                     </li>
                  </ul>
               </div>
            </nav>
         </div>
      );
   }
}

const Header = connect(mapStateToProps)(HeaderView);
export { Header };
export default Header;