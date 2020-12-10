import React, { Component } from 'react';
import { connect } from "react-redux";
import { Link } from 'react-router-dom';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class IndexView extends Component {

   constructor(props) {
      super(props);

      this.renderLoggedOutScreen = this.renderLoggedOutScreen.bind(this);
   }

   componentDidMount() {

   }

   renderLoggedOutScreen() {
      return (
         <div className="container">
            <div className="row">
               <h1 className="col text-left">
                  Welcome to the Assisted Grader
               </h1>
            </div>
            <div className="row">
               <div className="col text-left">
                  The Assisted Grader is a research project / pedagogical tool designed by Dr. Adam Carter.
                  Its purpose is twofold:
               <ol>
                     <li>To allow for students to continually test their assignments throughout the assignment
                        completion process.  The benefits of this approach are being actively investigated in
                     Dr. Carter's research.</li>
                     <li>To provide a research platform that enables Dr. Carter to investigate learning as it
                        pertains to computer science education.  While new research questions are always being
                        generated, you may visit a list of past publications at&nbsp;
                     <a href="https://adamcarter.com/publications">https://adamcarter.com/publications</a></li>
                  </ol>
               </div>
            </div>
            <div className="row">
               <div className="col text-left">
               If you are a student that is using the Assisted Grader, your first step is to&nbsp; 
                <Link to="/account/create">create an account</Link> in the system.  If you have
               already registered, you may <Link to="/account/login">log in</Link> using the 
               Account dropdown in the top menu.
               </div>
            </div>
         </div>
      );
   }


   render() {
      return this.renderLoggedOutScreen();
   }
}

const Index = connect(mapStateToProps)(IndexView);
export { Index };
export default Index;