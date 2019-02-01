import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';

//right click context menu
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

//views
import UserSessionView from './views/UserSessionView.js';
import AssignmentFilesView from './views/AssignmentFilesView.js';
import CreateUserView from './views/User/CreateUserView.js';

//view models
import Session from './view_models/Session.js';

//models
import User from './models/User.js';

import './App.css';
import ConfigManager from './config.js';

var config = ConfigManager.getConfig();

class App extends Component {

   constructor(props) {
      super(props);

      this.state = {
         current_assignment: {},
         current_user: {}
      };

      this.session = Session;
      this.user_model = new User(config, false);

      this.assignmentChanged = this.assignmentChanged.bind(this);
      this.userChanged = this.userChanged.bind(this);
      this.renderUserSession = this.renderUserSession.bind(this);
      this.renderAssignmentFiles = this.renderAssignmentFiles.bind(this);
   }

   assignmentChanged(assignment) {
      this.setState({ current_assignment: assignment });
   }

   userChanged(user) {
      this.setState({ current_user: user });
   }

   renderUserSession() {
      return (
         <UserSessionView
            config={config}
            onAssignmentChange={this.assignmentChanged}
            onUserChange={this.userChanged}
            user_model={this.user_model}
         />
      );
   }

   renderAssignmentFiles() {
      if (this.state.current_user.id !== undefined && this.state.current_assignment.id !== undefined) {
         return (
            <AssignmentFilesView
               config={config}
               current_user={this.state.current_user}
               current_assignment={this.state.current_assignment}
            />
         );
      }
      else {
         return (<div></div>);
      }

   }

   render() {
      return (
         <div className="App">
            {this.renderUserSession()}
            {this.renderAssignmentFiles()}
            <Router>
               
            <Route path="/user/create"
                  render={
                     ({ match }, props) => {
                        return (
                           <div className="container">
                              <CreateUserView
                                 user_model={this.user_model}
                              />
                           </div>
                        )
                     }
                  } />
                  </Router>
         </div>
      );
   }
}


export default App;
