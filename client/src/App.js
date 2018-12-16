import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';

//views
import AddFilesView from './views/AddFilesView.js';
import LoginView from './views/LoginView.js';

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
         active_tab: "/add-files"
      };

      this.setActiveLink = this.setActiveLink.bind(this);
      this.updateFiles = this.updateFiles.bind(this);
   }

   setActiveLink(evt) {
      const url = evt.target.pathname;
      this.setState({ active_tab: url });
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
      return (
         <div className="App">
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
