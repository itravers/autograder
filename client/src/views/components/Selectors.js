import React, { Component } from 'react';

class ArrayIndexSelect extends Component{

   render(){
      const {data, selectedValue, onChange, size, name, id, className} = this.props;
      return(
         <select 
         id={id} 
         name={name}
         className={className}
         value={selectedValue} 
         onChange={onChange} 
         size={size} 
         
         >
            {data.map( (value, index) =>
               <option key={index} value={index}>{value}</option>
      )}
         </select>
      );
   }
}

class ArrayValueSelect extends Component{

   render(){
      const {data, selectedValue, onChange, size} = this.props;
      return(
         <select value={selectedValue} onChange={onChange} size={size}>
            {data.map( (value) =>
               <option key={value} value={value}>{value}</option>
      )}
         </select>
      );
   }
}

export {ArrayIndexSelect, ArrayValueSelect};