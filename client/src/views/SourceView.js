import React, { Component } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/styles/hljs';

class SourceView extends Component{

   render(){
      const source_file = this.props.source;
      return(
         <div>
            <SyntaxHighlighter 
            language='javascript' 
            style={vs} 
            showLineNumbers={true}
            >{source_file.contents}</SyntaxHighlighter>
         </div>
      );
   }
}

export {SourceView};
export default SourceView;