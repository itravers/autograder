import React, { Component } from 'react';
import { connect } from "react-redux";

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class ResultsComponent extends Component {

   render() {
      return (
         <div>
         </div>
      );
   }
}

const Results = connect(mapStateToProps)(ResultsComponent);
export { Results };
export default Results;