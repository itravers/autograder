import React, { Component } from 'react';
import FileUploader from './views/FileUploader.js';

class SourceViewer extends Component{

   constructor(props){
      super(props);
   }

   render(){
      return(
         <div>
            <FileUploader />
         </div>
      );
   }
}

export {SourceViewer};
export default SourceViewer;