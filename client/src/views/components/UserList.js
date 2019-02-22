import React, { Component } from 'react';

class UserList extends Component {

   render() {
      const { header, raw_data, data_cols } = this.props;
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
                  <tr>
                     <td></td>
                     {data_cols.map(col =>
                        <td key={index}>{item[col]}</td>
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