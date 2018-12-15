import React, { Component } from 'react';
import { FilePond, File, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);

class AddFilesViews extends Component{

   constructor(props){
      super(props);

      this.file_types = ['text/x-c', 'text/x-h', 'text/plain'];
   }

   render(){
      const serverEndpoint = this.props.server_endpoint;
      const update_callback = this.props.file_update_callback;
      return(
         <div>
            <h1>Add Files</h1>
            <p>
               Add your project files here.  Navigate away when you're done.
            </p>
            <FilePond 
               allowMultiple={true} 
               server={serverEndpoint} 
               allowFileSizeValidation="true"
               maxFileSize="100KB"
               onupdatefiles={(fileItems) =>{
                  update_callback(fileItems.map(fileItem => fileItem.file))
               }
               }
               />
         </div>
      );
   }
}

export {AddFilesViews};
export default AddFilesViews;