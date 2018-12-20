import React, { Component } from 'react';
import Session from './view_models/Session.js';

class FileView extends Component{

   constructor(props){
      super(props);

      this.state = {
         file_contents: ""
      };

      this.session = Session;
      const file_name = this.props.file_name;
      this.getFileContents = this.getFileContents.bind(this);
   }

   getFileContents(){

   }

   render(){
      const current_user = this.session.get("current_user");
      const file_name = this.props.file_name;
      return(
         <div>
            <h1>Add Files</h1>
            <p>
               Add your project files here  Uploading files with the same name will overwrite existing files on the server.<br />
               Navigate away when you're done.                
            </p>
            <FilePond 
               ref={ref => this.pond = ref}
               allowMultiple={true} 
               server={{
                  url: serverEndpoint,
                  process: {
                     withCredentials: true
                  }
               }} 
               allowFileSizeValidation="true"
               maxFileSize="100KB"
               withCredentials = {true}
               onupdatefiles={(fileItems) =>{
                  update_callback(fileItems.map(fileItem => fileItem.file))
               }}
               />
         </div>
      );
   }
}

export {FileView};
export default FileView;