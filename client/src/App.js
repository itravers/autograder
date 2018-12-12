import React, { Component } from 'react';

import './App.css';
import ConfigManager from './config.js';

var config = ConfigManager.getConfig();

class App extends Component {

   render() {
      return (
         <div className="App">
            <div className="container">
               <div className="row">
                  <div className="col">
                     <ul class="nav nav-tabs">
                        <li class="nav-item">
                           <a class="nav-link" href="#">test cases</a>
                        </li>
                        <li class="nav-item">
                           <a class="nav-link active" href="#">main.cpp</a>
                        </li>
                        <li class="nav-item">
                           <a class="nav-link" href="#">functions.h</a>
                        </li>
                        <li class="nav-item">
                           <a class="nav-link" href="#">functions.cpp</a>
                        </li>
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      );
   }
}

export default App;
