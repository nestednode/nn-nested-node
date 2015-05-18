import NestedText = require('./NestedText');
import DocumentActions = require('./DocumentActions');
import React = require('pkg/React/React');
export interface NestedTextProps {
    nodeData: NestedText;
}
export interface DocumentContext {
    documentActions?: DocumentActions;
}
export interface DocumentProps extends NestedTextProps, DocumentContext {
}
export declare var NestedTextElem: any;
export declare var NestedTextDocumentElem: React.ReactElementFactory<DocumentProps>;
