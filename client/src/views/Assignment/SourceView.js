import React, { Component } from 'react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/styles/hljs';

class SourceView extends Component {

   render() {
      let source_file = this.props.source;
      if (source_file === undefined) {
         source_file = {contents: ""};
      }
      return (
         <div style={{ textAlign: "left" }}>
            <SyntaxHighlighter
               language="cpp"
               style={vs}
               showLineNumbers={true}

            >{source_file.contents}</SyntaxHighlighter>
         </div>
      );
   }
}

export { SourceView };
export default SourceView;