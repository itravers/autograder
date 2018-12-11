import React, { Component } from 'react';
import { FilePond } from 'react-filepond';
import 'filepond/dist/filepond.min.css';

class FileUploader extends Component{

   render(){
      const {serverEndpoint, fileUploadedCallback} = this.props;
      return(
         <div>
            <FilePond 
               allowMultiple={true} 
               server={config.serverEndpoint} 
               onaddfile={fileUploadedCallback}
               />
         </div>
      );
   }
}

export {FileUploader};
export default FileUploader;