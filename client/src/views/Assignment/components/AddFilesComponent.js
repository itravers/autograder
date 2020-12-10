import React, { Component } from 'react';
import { connect } from "react-redux";
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

registerPlugin(FilePondPluginFileValidateType, FilePondPluginFileValidateSize);


const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models, config: state.config };
};

class AddFilesComponent extends Component{

   constructor(props){
      super(props);
      this.pond = null;
      this.file_types = ['text/x-c', 'text/x-h', 'text/plain'];

      this.addFile = this.addFile.bind(this);
      this.removeFile = this.removeFile.bind(this);
      this.serverEndpoint = this.serverEndpoint.bind(this);
   }

   addFile(error, file){
      const add_callback = this.props.file_add_callback;
      if(error === null){
         let raw_file = file.file;
         raw_file.id = file.serverId;
         let files = [];
         files.push(raw_file);
         add_callback(files);
      }
   }

   serverEndpoint(){
      const path = this.props.config.endpoints.assignment.file; 
      const serverEndpoint = this.props.config.constructRoute(path, [this.props.assignment.id]);
      return serverEndpoint;
   }

   removeFile(raw_file){

      //file pond isn't sending delete messages to server correctly.  Manual hack
      //until I figure it out.
      this.props.models.assignment.removeFile(raw_file, this.props.assignment.id)
      .then((file) => {
         this.props.file_remove_callback(file);
      })
      .catch((file) => {});
   }

   render(){
      const serverEndpoint = this.serverEndpoint();
      return(
         <div>
            <h1>Add Files</h1>
            <p>
               Add your project files here  Uploading files with the same name will overwrite existing files on the server.<br />
               Navigate away when you're done.                
            </p>
            <FilePond 
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
               onprocessfile={this.addFile}
               onremovefile={this.removeFile}
               />
         </div>
      );
   }
}

const AddFiles = connect(mapStateToProps)(AddFilesComponent);

export {AddFiles};
export default AddFiles;