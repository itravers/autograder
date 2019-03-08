import React, { Component } from 'react';
import { connect } from "react-redux";

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class ResultsComponent extends Component {

   constructor(props){
      super(props);

      this.state = {
         result: {}
      };

      this.getTestResults = this.getTestResults.bind(this);
   }

   componentDidMount(){
      this.getTestResults(this.props.user.id);
   }

   componentWillReceiveProps(new_props){
      if(new_props.user !== null && new_props.user !== undefined && new_props.user.id > 0){
         this.getTestResults(new_props.user.id);
      }
   }

   getTestResults(user_id){
      this.props.models.assignment.getTestResults(this.props.assignment.id, user_id)
      .then((result) => {
         this.setState({results: result});
      })
      .catch((err) => console.log(err));
   }

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