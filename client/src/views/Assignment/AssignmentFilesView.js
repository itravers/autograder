import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';

//right click context menu
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

//views
import AddFilesView from './AddFilesView.js';
import SourceView from './SourceView.js';
import TestCaseView from './TestCasesView.js';

//view models
import WebRequest from '../../view_models/WebRequest.js';
import PrivateRoute from '../../view_models/PrivateRoute.js';
import Session from '../../view_models/Session.js';

class AssignmentFilesView extends Component {

   constructor(props) {
      super(props);

      this.base_links =
         [{
            id: -1,
            url: "/add-files",
            name: "Add File(s)",
            css: "nav-link"
         },
         {
            id: -1,
            url: "/run",
            name: "Run",
            css: "nav-link"
         }
         ];
      this.state = {
         links: this.base_links,
         files: [],
         file_data: {},
         active_tab: "/add-files"
      };

      this.config = this.props.config;

      this.session = Session;

      this.setActiveLink = this.setActiveLink.bind(this);
      this.updateFiles = this.updateFiles.bind(this);
      this.getAssignmentFiles = this.getAssignmentFiles.bind(this);
      this.removeTab = this.removeTab.bind(this);
      this.render = this.render.bind(this);
   }

   componentDidMount(){
      this.getAssignmentFiles();
   }

   componentWillReceiveProps(){
      this.getAssignmentFiles();
   }

   getAssignmentFiles() {
      if(this.props.current_user.id !== undefined && this.props.current_assignment.id !== undefined){
         const url = this.config.endpoints.assignment.file + "/" + this.props.current_assignment.id;
         WebRequest.makeUrlRequest(url, (result) => {
            const data = result.data.response;
            let file_data = {};
            let file_links = [];
            for (const item of data) {
               item.type = "text/plain";
               item.lastModified = 0;
               item.name = item.file_name;
               file_data[item.file_name] = item;
               file_links.push(item);
            }
            this.setState({ file_data: file_data, files: file_links }, () =>{
               this.updateTabs();
            });
         });
      }
   }

   setActiveLink(evt) {
      const url = evt.target.pathname;
      this.setState({ active_tab: url });
   }

   updateTabs() {
      const files = this.state.files;
      let links = [...this.base_links];
      let links_by_name = {};
      for (let key of Object.keys(files)) {
         const file = files[key];
         const url = "/files/" + file.name.toLowerCase();
         const tab = { id: file.id, url: url, name: file.name, css: "nav-link" };
         links_by_name[tab.url] = tab;
      }
      for (let key of Object.keys(links_by_name)) {
         links.push(links_by_name[key]);
      }
      this.setState({ links: links });
   }

   updateFiles(files) {
      let previous_files = { ...this.state.files };
      for (let file of files) {
         previous_files[file.name] = file;
      }
      this.setState({ files: previous_files }, () => {
         this.updateTabs();
         this.getAssignmentFiles();
      });
   }

   removeTab(file_name) {
      let files = { ...this.state.files };
      delete files[file_name];
      this.setState({ files: files }, () => {
         this.updateTabs();
      });
   }

   render() {
      const links = this.state.links;
      const state = this.state;
      return (
         <div>
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
                                 <ContextMenuTrigger
                                    id="FileTabs"
                                    name={item.id}
                                    holdToDisplay={1000}
                                    className="well"
                                 >
                                    <Link
                                       to={item.url}
                                       className={style}
                                       onClick={this.setActiveLink}
                                    >{item.name}</Link>
                                 </ContextMenuTrigger>
                              </li>
                           );
                        })}
                     </ul>
                  </nav>
                  <Route path="/files/:name"
                     render={
                        ({ match }, props) => {
                           const file_name = match.params.name;
                           const file_data = state.file_data[file_name];
                           return (
                              <div className="container">
                                 <SourceView
                                    source={file_data}
                                 />
                              </div>
                           )
                        }
                     } />
                  <Route path="/add-files"
                     render={
                        (props) => {
                           return (
                              <div className="container">
                                 <AddFilesView
                                    server_endpoint={this.config.endpoints.assignment.file}
                                    file_add_callback={this.updateFiles}
                                    file_remove_callback={this.removeTab}
                                    files={this.state.files}
                                 />
                              </div>
                           )
                        }} />
                  <Route path="/run"
                     render={
                        (props) => {
                           return (
                              <div className="container">
                                 <TestCaseView
                                    config={this.props.config}
                                    assignment_id = {this.props.current_assignment.id}
                                 />
                              </div>
                           )
                        }} />

               </div>
            </Router>
            <ContextMenu id="FileTabs">
               <MenuItem>Remove File</MenuItem>
            </ContextMenu>
         </div>
      );
   }
}

export { AssignmentFilesView };
export default AssignmentFilesView;