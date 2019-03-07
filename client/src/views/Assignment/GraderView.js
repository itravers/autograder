import React, { Component } from 'react';
import { connect } from "react-redux";

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class GraderView extends Component {

   constructor(props) {
      super(props);
      this.state = {};
   }


   render() {
      
      return (
         <div>Grader
         </div>
      );
   }
}

const Grader = connect(mapStateToProps)(GraderView);
export { Grader };
export default Grader;