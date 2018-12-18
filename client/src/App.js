import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';

//views
import AddFilesView from './views/AddFilesView.js';
import LoginView from './views/LoginView.js';

//view models
import WebRequest from './view_models/WebRequest.js';
import PrivateRoute from './view_models/PrivateRoute.js';

import './App.css';
import ConfigManager from './config.js';

var config = ConfigManager.getConfig();

class App extends Component {

   constructor(props) {
      super(props);

      this.base_links = 
         [{
            url: "/add-files",
            name: "Add File(s)",
            css: "nav-link"
         },
            {
               url: "/test_cases",
               name: "Test Cases",
               css: "nav-link"
            }
         ];
      this.state = {
         links: this.base_links,
         files: [],
         previous_files: [],
         active_tab: "/add-files",
         current_user: null,
         courses: [],
         assignments: [],
         current_course: -1,
         current_assignment: -1
      };

      this.setActiveLink = this.setActiveLink.bind(this);
      this.updateFiles = this.updateFiles.bind(this);
      this.updateCurrentUser = this.updateCurrentUser.bind(this);
      this.getCourseData = this.getCourseData.bind(this);
      this.getCourseAssignments = this.getCourseAssignments.bind(this);
   }

   getCourseData(){
      WebRequest.makeCacheableUrlRequest(config.UserCoursesEndpoint + "/" + this.state.current_user.id, (result) =>{
         this.setState({courses: result});
      });
   }

   getCourseAssignments(){
      WebRequest.makeUrlRequest(config.CourseActiveAssignmentsEndpoint + "/" + this.state.current_course, (result) =>{
         this.setState({assignments: result});
      });
   }

   setActiveLink(evt) {
      const url = evt.target.pathname;
      this.setState({ active_tab: url });
   }

   updateCurrentUser(user){
      this.setState({current_user: user}, () => {this.getCourseData();});
   }

   updateTabs() {
      const files = this.state.files;
      let links = [...this.base_links];
      let links_by_name = {};
      for(let file of this.state.previous_files){
         const url = "/files/" + file.name.toLowerCase();
         const tab = { url: url, name: file.name, css: "nav-link" };
         links_by_name[tab.url] = tab;
      }
      for (let key of Object.keys(files)) {
         const file = files[key];
         const url = "/files/" + file.name.toLowerCase();
         const tab = { url: url, name: file.name, css: "nav-link" };
         links_by_name[tab.url] = tab;
      }
      for(let key of Object.keys(links_by_name)){
         links.push(links_by_name[key]);
      }
      this.setState({links: links});
   }

   updateFiles(files) {
      this.setState({ previous_files: this.state.files, files: files }, () => { this.updateTabs() });
   }

   render() {
      const links = this.state.links;
      const courses = this.state.courses;
      return (
         <div className="App">
            <select>
               {courses.map((item) =>{
                  return(
                     <option key={item}>item</option>
                  );
               })}
            </select>
            <Router>
               <div>
                  <nav>
                     <ul className="nav nav-tabs">
                        {Object.keys(links).map((key) => {
                           const item = links[key];
                           const active_tab = this.state.active_tab;
                           let style = "nav-link";
                           if (active_tab === item.url) {
                              style += " active";
                           }
                           return (
                              <li key={item.url} className="nav-item">
                                 <Link
                                    to={item.url}
                                    className={style}
                                    onClick={this.setActiveLink}
                                 >{item.name}</Link>
                              </li>
                           );
                        })}
                     </ul>
                  </nav>
                  <Route path="/add-files"
                     render={
                        (props) => {
                           return (
                              <div className="container">
                                 <AddFilesView
                                    server_endpoint={config.CodeUploadEndpoint}
                                    file_update_callback={this.updateFiles}
                                    files={this.state.files}
                                 />
                              </div>
                           )
                        }} />
                  <Route path="/login"
                     render={
                        (props) => {
                           return (
                              <div className="container">
                                 <LoginView
                                    server_endpoint={config.LoginEndpoint}
                                    update_user={this.updateCurrentUser}
                                 />
                              </div>
                           )
                        }} />
               </div>
            </Router>
         </div>
      );
   }
}

const AddFiles = (source) => {

   return (
      <div className="container">
         <AddFilesView
            server_endpoint={config.code_upload_endpoint}
         />
      </div>
   );
};

export default App;
