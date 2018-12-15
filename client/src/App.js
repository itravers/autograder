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

      this.state = {
         links: {
            add_files: {
               url: "/add-files",
               name: "Add File(s)",
               css: "nav-link active"
            },
            test_cases: {
               url: "/test_cases",
               name: "Test Cases",
               css: "nav-link"
            }
         },
         files: []
      };

      this.setActiveLink = this.setActiveLink.bind(this);
      this.updateFiles = this.updateFiles.bind(this);
   }

   setActiveLink(evt) {
      let url = evt.target.pathname;
      let links = this.state.links;
      for (let key of Object.keys(links)) {
         let link = links[key];
         link.css = "nav-link";
         if (link.url === url) {
            link.css += " active";
         }
      }
      this.setState({ links: links });
   }

   updateFiles(files) {
      this.setState({files: files});
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
                           return (
                              <li key={item.url} className="nav-item">
                                 <Link
                                    to={item.url}
                                    className={item.css}
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
