import React, { Component } from 'react';
import { connect } from "react-redux";
import { Redirect } from 'react-router'; 

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class AllResultsComponent extends Component {

   constructor(props) {
      super(props);

      this.state = {
         test_names: [], 
         results: {}
      };

      this.getTestNames = this.getTestNames.bind(this); 
      this.getTestResults = this.getTestResults.bind(this);
   }

   componentDidMount() {
      this.getTestNames(this.props.assignment.id); 
      //this.getTestResults(this.props.user.id);
   }

   componentWillReceiveProps(new_props) {
      if (new_props.user !== null && new_props.user !== undefined && new_props.user.id > 0) {
         this.getTestResults(new_props.user.id);
      }
   }

   getTestNames() {
      if (this.props.assignment.id > 0) {
         this.props.models.assignment.getTestCases(this.props.assignment.id)
         .then((results) => {
            let names = []; 
            for (const result of results) {
               names.push(result.test_name); 
            }
            this.setState({test_names: names}); 
         })
         .catch((err) => console.log(err)); 
      }
   }

   getTestResults(user_id) {
      if (this.props.assignment.id > 0) {
         this.props.models.assignment.getTestResults(this.props.assignment.id, user_id)
            .then((results) => {
               let formatted_results = {};
               for (const result of results) {
                  if (formatted_results[result.test_name] === undefined) {
                     formatted_results[result.test_name] = [];
                  }
                  formatted_results[result.test_name].push(result);
               }
               this.setState({ results: formatted_results });
            })
            .catch((err) => console.log(err));
      }
   }

   render() {
      if(this.props.modify_permissions === false)
      {
        return(<Redirect to="/assignment" />);
      }
    
      const headers = this.state.headers; 
      const results = this.state.results;
      let results_counter = 0;
      let first_active_id = -1;

      return (
        <article className="container">
           <article>
               <table className = "table table-striped text-left">
                  <thead>
                     <tr>
                        <th scope="col"></th>
                        <th scope="col">ADD TEST CASE NAMES AS COLUMNS</th> 
                     </tr>
                  </thead>
                  <tbody> 
                     <tr>
                        <td> hi </td>
                     </tr>
                  </tbody>
               </table> 
           </article>
        </article> 

      );
      /*
      return (
         <div className="row" style={{ paddingTop: "1.1rem" }}>
            <div className="col-3">
               <div className="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                  {Object.keys(results).map((index) => {
                     const first_item = results[index][0];
                     const item_id = "v-pills-" + first_item.id + "-tab";
                     const item_href = "#v-pills-" + first_item.id;
                     const item_controls = "v-pills" + first_item.id;
                     let class_name = "nav-link";
                     let is_selected = "false";
                     if (results_counter === 0) {
                        class_name += " active";
                        is_selected = "true";
                        first_active_id = first_item.id;
                     }
                     results_counter++;
                     return (
                        <a
                           key={first_item.id}
                           className={class_name}
                           id={item_id}
                           data-toggle="pill"
                           href={item_href}
                           role="tab"
                           aria-controls={item_controls}
                           aria-selected={is_selected}
                        >{first_item.test_name}</a>
                     )
                  })
                  }
               </div>
            </div>

            <div className="col-9">
               <div className="tab-content" id="v-pills-tabContent">
               {Object.keys(results).map((index) => {
                     const first_item = results[index][0];
                     const item_id = "v-pills-" + first_item.id;
                     const tab_name = "v-pills-" + first_item.id + "-tab";
                     let class_name = "tab-pane fade";
                     if (first_item.id === first_active_id) {
                        class_name += " show active";
                     }
                     return (
                        <div
                           key={first_item.id}
                           className={class_name}
                           id={item_id}
                           role="tabpanel"
                           aria-labelledby={tab_name}
                        >                          
                           <div>
                              <h6 style={{fontWeight: "bold"}}>Date run:</h6>
                              {first_item.date_run}
                           </div>
                           <div><hr></hr></div>
                           <div>
                              <h6 style={{fontWeight: "bold"}}>Inputs:</h6>
                              <pre>{first_item.test_input}</pre>
                           </div>
                           <div><hr></hr></div>
                           <div>
                              <h6 style={{fontWeight: "bold"}}>Test results:</h6>
                              {first_item.test_result}
                           </div>
                        </div>
                     )
                  })
                  }
               </div>
            </div>
         </div>
      );*/
   }
}

const AllResults = connect(mapStateToProps)(AllResultsComponent);
export { AllResults };
export default AllResults;