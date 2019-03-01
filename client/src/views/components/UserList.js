import React, { Component } from 'react';

const ManageButton = ({user_id, click_event, button_text}) => {
   return (<button className="btn btn-primary" data-id={user_id} onClick={click_event}>{button_text}</button>)
}

class UserList extends Component {

   render() {
      const { header, raw_data, data_cols, buttons } = this.props;
      return (
         <table className="table table-striped text-left">
            <thead>
               <tr>
               <th scope="col"></th>
                  {header.map((item, index) =>
                     <th key={index} scope="col">{item}</th>
                  )}
               </tr>
            </thead>
            <tbody>

               {raw_data.map((item, index) =>
                  <tr key={index}>
                     <td>
                     {buttons.map((button_item, button_index) =>
                        <span key={button_index}><ManageButton user_id={index} click_event={button_item.click} button_text={button_item.text} />&nbsp;</span>
                     )}
                     </td>
                     {data_cols.map((col, col_key) =>
                        <td key={col_key}>{item[col]}</td>
                     )}
                  </tr>
               )}

            </tbody>
         </table>
      );
   }
}

export { UserList };
export default UserList;