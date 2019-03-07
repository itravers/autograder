import React, { Component } from 'react';
import { connect } from "react-redux";
import { BrowserRouter as Router, Route, NavLink, Redirect, withRouter } from 'react-router-dom';
import CourseAssignmentSelector from '../components/CourseAssignmentSelector'

//components
import AddFiles from './components/AddFilesComponent';
import Source from './components/SourceViewComponent';
import TestCases from './components/TestCasesComponent';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class IndexView extends Component {

   constructor(props) {
      super(props);

      this.base_links =
         [{
            id: -1,
            url: "/assignment/add-files",
            name: "Add File(s)",
            css: "nav-link"
         },
         {
            id: -1,
            url: "/assignment/run",
            name: "Run",
            css: "nav-link"
         }
         ];
      this.state = {
         links: this.base_links,
         files: [],
         file_data: {},
         current_assignment: {id: -1}
      };

      this.onAssignmentChange = this.onAssignmentChange.bind(this);
      this.updateFiles = this.updateFiles.bind(this);
      this.getAssignmentFiles = this.getAssignmentFiles.bind(this);
      this.removeTab = this.removeTab.bind(this);
      this.render = this.render.bind(this);
   }

   onAssignmentChange(assignment){
      this.setState({current_assignment: assignment}, () => {
         this.getAssignmentFiles();
      });
   }

   getAssignmentFiles() {
      if(this.props.current_user.id > 0 && this.state.current_assignment.id > 0){
         this.props.models.assignment.getFiles(this.state.current_assignment.id)
         .then( (result) => {
            this.setState({ file_data: result.data, files: result.links }, () =>{
               this.updateTabs();
            });
         })
         .catch(() => {});
      }
   }

   updateTabs() {
      const files = this.state.files;
      let links = [...this.base_links];
      let links_by_name = {};
      for (let key of Object.keys(files)) {
         const file = files[key];
         const url = "/assignment/files/" + file.name.toLowerCase();
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

      //always start out at the file upload component
      if(this.props.location.pathname.toLowerCase() == '/assignment/' || this.props.location.pathname.toLowerCase() == '/assignment')
      {
         return(<Redirect to="/assignment/add-files" />)
      }
      return (
         <div>
            <CourseAssignmentSelector
               onAssignmentChange={this.onAssignmentChange} />
               <div>
                  <nav>
                     <ul className="nav nav-tabs">
                        {Object.keys(links).map((key) => {
                           const item = links[key];
                           const active_tab = this.state.active_tab;
                           let style = "nav-link";
                           return (
                              <li key={item.url} className="nav-item">
                                    <NavLink
                                       to={item.url}
                                       className={style}
                                       activeClassName="active"
                                    >{item.name}</NavLink>
                              </li>
                           );
                        })}
                     </ul>
                  </nav>
                  <Route path="/assignment/files/:name"
                     render={
                        ({ match }, props) => {
                           const file_name = match.params.name;
                           const file_data = state.file_data[file_name];
                           return (
                              <div className="container">
                                 <Source
                                    source={file_data}
                                 />
                              </div>
                           )
                        }
                     } />
                  <Route path="/assignment/add-files"
                     render={
                        (props) => {
                           return (
                              <div className="container">
                                 <AddFiles
                                    assignment={this.state.current_assignment}
                                    file_add_callback={this.updateFiles}
                                    file_remove_callback={this.removeTab}
                                    files={this.state.files}
                                 />
                              </div>
                           )
                        }} />
                  <Route path="/assignment/run"
                     render={
                        (props) => {
                           return (
                              <div className="container">
                                 <TestCases assignment={this.state.current_assignment} />
                              </div>
                           )
                        }} />
               </div>
         </div>
      );
   }
}

const Index = connect(mapStateToProps)(IndexView);
export { Index };
export default withRouter(Index);