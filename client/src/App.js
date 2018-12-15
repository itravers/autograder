import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';

//views
import AddFilesView from './views/AddFilesView.js';

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
      for (let key of Object.keys(files)) {
         const file = files[key];
         const url = "/files/" + file.name.toLowerCase();
         const tab = { url: url, name: file.name, css: "nav-link" };
         links.push(tab);
      }
      this.setState({links: links});
   }

   updateFiles(files) {
      this.setState({ files: files }, () => { this.updateTabs() });
   }

   render() {
      const links = this.state.links;
      return (
         <div className="App">
            <Router>
               <div>
                  <nav>
                     <ul class="nav nav-tabs">
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
