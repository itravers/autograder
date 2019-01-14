import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';

//right click context menu
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

//views
<<<<<<< HEAD
import UserSessionView from './views/UserSessionView.js';
import AssignmentFilesView from './views/AssignmentFilesView.js';

//view models
=======
import AddFilesView from './views/AddFilesView.js';
import SourceView from './views/SourceView.js';
import UserSession from './views/UserSession.js';

//view models
import WebRequest from './view_models/WebRequest.js';
import PrivateRoute from './view_models/PrivateRoute.js';
>>>>>>> d2554608717bf887f2acbf97b4181fd6f71f1641
import Session from './view_models/Session.js';


import './App.css';
import ConfigManager from './config.js';
import AddFilesViews from './views/AddFilesView.js';

var config = ConfigManager.getConfig();

class App extends Component {

   constructor(props) {
      super(props);

      this.state = {
         current_assignment: {},
         current_user: {}
      };

      this.session = Session;
      this.assignmentChanged = this.assignmentChanged.bind(this);
      this.userChanged = this.userChanged.bind(this);
      this.renderUserSession = this.renderUserSession.bind(this);
      this.renderAssignmentFiles = this.renderAssignmentFiles.bind(this);
   }

   assignmentChanged(assignment){
      this.setState({current_assignment: assignment});
   }

   userChanged(user){
      this.setState({current_user: user});
   }

   renderUserSession(){
      return(
         <UserSessionView 
               config={config} 
               onAssignmentChange={this.assignmentChanged} 
               onUserChange={this.userChanged}
               />
      );
   }

   renderAssignmentFiles(){
      if(this.state.current_user.id !== undefined && this.state.current_assignment.id !== undefined){
         return(
            <AssignmentFilesView 
                  config={config} 
                  current_user={this.state.current_user}
                  current_assignment={this.state.current_assignment}  
                  />
         );
      }
      else{
         return(<div></div>);
      }
      
   }

   render() {
      return (
         <div className="App">
            {this.renderUserSession()}
            {this.renderAssignmentFiles()}
            
         </div>
      );
   }
}


export default App;
