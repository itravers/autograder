import React, { Component } from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import './App.css';
import ConfigManager from './config.js';

var config = ConfigManager.getConfig();

class App extends Component {
   render() {
      return (
         <div className="App">
            <FilePond allowMultiple={true} server={config.CodeUploadEndpoint} />
         </div>
      );
   }
}

export default App;
