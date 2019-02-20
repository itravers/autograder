import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';

//right click context menu
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

//view models
import Session from './view_models/Session.js';

//master layout
import Header from './views/Header'

import './App.css';
import routes from './views/routes';

import { connect } from "react-redux";
import { updateUser } from './actions/index';

const RouteWithSubRoutes = route => (
   <Route
      exact path={route.path}
      render={props => (
         // pass the sub-routes down to keep nesting
         <route.component {...props} routes={route.routes} />
      )}
   />
);

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

const mapDispatchToProps = dispatch => {
   return {
      updateUser: user => dispatch(updateUser(user))
   };
};

class AppView extends Component {

   constructor(props) {
      super(props);

      this.state = {
         current_assignment: {},
         current_user: {}
      };
      this.session = Session;
   }

   componentDidMount(){

      //no user at app launch?  Check server to see
      //if we have an active session.
      if(this.props.current_user.id < 1){
         this.props.models.user.currentUser()
         .then(user => {
            if(user.id > 0){
               return this.props.updateUser(user);
            }
         })
         .catch(() => {});
      }
   }

   render() {
      return (
         <div className="App">
            <Router>
               <div>
                  <Header />
                  <div id="PageContents">
                     {routes.map((route, i) => <RouteWithSubRoutes key={i} {...route} />)}
                  </div>
               </div>
            </Router>
         </div>
      );
   }
}

const App = connect(mapStateToProps, mapDispatchToProps)(AppView);

export default App;
