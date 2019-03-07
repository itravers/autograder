import React, { Component } from 'react';
import { connect } from "react-redux";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vs } from 'react-syntax-highlighter/dist/styles/hljs';

const mapStateToProps = state => {
   return { current_user: state.current_user, models: state.models };
};

class SourceViewComponent extends Component {

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

const SourceView = connect(mapStateToProps)(SourceViewComponent);
export { SourceView };
export default SourceView;