import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';

//right click context menu
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

//view models
import Session from './view_models/Session.js';

//master layout
import Header from './views/Header'

import './App.css';
import ConfigManager from './config.js';
import routes from './views/routes';

var config = ConfigManager.getConfig();

const RouteWithSubRoutes = route => (
   <Route
      path={route.path}
      render={props => (
         // pass the sub-routes down to keep nesting
         <route.component {...props} routes={route.routes} />
      )}
   />
);

class App extends Component {

   constructor(props) {
      super(props);

      this.state = {
         current_assignment: {},
         current_user: {}
      };

      this.session = Session;
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


export default App;
