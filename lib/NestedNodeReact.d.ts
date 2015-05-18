import NestedNodeData = require('./NestedNodeData');
import DocumentActions = require('./DocumentActions');
import React = require('pkg/React/React');
export interface NestedNodeProps {
    nodeData: NestedNodeData;
}
export interface DocumentContext {
    documentActions?: DocumentActions;
}
export interface DocumentProps extends NestedNodeProps, DocumentContext {
}
export declare var NestedNodeElem: any;
export declare var NestedNodeDocumentElem: React.ReactElementFactory<DocumentProps>;
