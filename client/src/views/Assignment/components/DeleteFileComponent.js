import React, { Component } from 'react';
import { connect } from "react-redux";
import { withRouter } from "react-router"; 
import { BrowserRouter as Redirect } from 'react-router-dom';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class DeleteFileComponent extends Component {
   constructor(props) {
       super(props); 

       this.deleteFile = this.deleteFile.bind(this);  
       this.handleClose = this.handleClose.bind(this); 
   }

   deleteFile() {
    const self = this; 
    self.props.models.assignment.removeFile(this.props.selected_file, this.props.assignment.id)
      .then(() => {
        // could have callback like this, or display a "file deleted message" here  
        // this.props.file_remove_callback(file);
        return new Promise((resolve, reject) => {
          self.props.history.push("/assignment/"); 
          resolve(true); 
        }); 
      })
      .then(() => {
        self.handleClose(); 
      })
      .catch(() => {});
   }

   handleClose() {
    this.props.toggle();
  }

  render() {
    if(this.props.selected_file === null) {
      return(<Redirect to="/assignment" />);
    }
    const file_name = this.props.selected_file.name; 
    return (
        <React.Fragment>
            <article className="modal_content container">
                <span className="close" onClick={this.handleClose}>
                    &times;
                </span>

                <p>Are you sure you would like to delete {file_name}? </p>

                <button className="btn btn-outline-primary" onClick={this.deleteFile}>Delete {file_name}</button>
                <button className="btn" onClick={this.handleClose}>Cancel</button>
            </article>
      </React.Fragment>
    );
  }
}

const DeleteFile = connect(mapStateToProps)(DeleteFileComponent);
export { DeleteFile };
export default withRouter(DeleteFile);