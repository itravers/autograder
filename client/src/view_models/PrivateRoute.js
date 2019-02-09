import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Link, Redirect } from 'react-router-dom';
function PrivateRoute ({component: Component, authed, ...rest}) {
   return (
     <Route
       {...rest}
       render={(props) => authed === true
         ? <Component {...props} />
         : <Redirect to={{pathname: '/login', state: {from: props.location}}} />}
     />
   )
 }
 export {PrivateRoute};
 export default PrivateRoute;