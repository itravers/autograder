import React, { Component } from 'react';
import { connect } from "react-redux";

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class CreateAssignmentComponent extends Component {
/*
   constructor(props) {
      super(props);

      this.state = {
         results: {}
      };

      this.getTestResults = this.getTestResults.bind(this);
   }

   componentDidMount() {
      this.getTestResults(this.props.user.id);
   }

   render() {
   
   }*/
   constructor(props) {
       super(props); 

       this.state = {
           course_id: 0, 
           assignment_name: "", 
           //TODO: figure out what datatype a checked box is supposed to be 
           locked: "",
           error_messages: ""
       }

       this.createAssignment = this.createAssignment.bind(this); 
       this.handleInputChange = this.handleInputChange.bind(this); 
       this.handleClose = this.handleClose.bind(this); 
   }

   handleInputChange(event) {
       const target = event.target; 
       const value = target.type === 'checkbox' ? target.checked : target.value; 
       const name = target.name; 

       this.setState({
           [name]: value
       })
   }

   createAssignment(evt) {
       evt.preventDefault(); 
       // replace with .assignment.create once it's done being built 
       /*
       this.props.models.user.create(this.state)
       .then((user) => {
          this.props.updateUser(user);
       })
       .catch((err) => {
          this.setState({ error_messages: err });
       });
       */
   }

   handleClose = () => {
    this.props.toggle();
  };

  render() {
    const course_id = this.state.course_id; 
    const assignment_name = this.state.assignment_name; 
    const locked = false; 
    return (
        <React.Fragment>
            <article className="modal_content container">
            <span className="close" onClick={this.handleClose}>
                &times;
            </span>

            <form className="" onSubmit={this.createAssignment}>
                <div className="form-group">
                    <label htmlFor="CourseId">Course: </label>
                    <select className="form-control"
                        id="CourseId"
                        name="course_id"
                        //value= TODO: figure out a way to get the course id from the parent component here
                        onChange={this.handleInputChange}>

                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="AssignmentName">Assignment name: </label>
                    <input
                        type="text"
                        className="form-control"
                        id="AssignmentName"
                        name="assignment_name"
                        value=""
                        onChange={this.handleInputChange}
                        placeholder="Name your assignment"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="IsLocked">Locked: </label>
                    <input
                        type="checkbox"
                        className="form-control"
                        id="IsLocked"
                        name="locked"
                        value="locked"
                        onChange={this.handleInputChange}
                    />
                </div>
                <button id="SubmitButton" className="btn btn-outline-primary" type="submit">Create Assignment</button>
            </form>
          </article>
      </React.Fragment>
    );
  }
}

const CreateAssignment = connect(mapStateToProps)(CreateAssignmentComponent);
export { CreateAssignment };
export default CreateAssignment;