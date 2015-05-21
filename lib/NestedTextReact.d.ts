import NestedText = require('./NestedText');
import DocumentActions = require('./DocumentActions');
import React = require('pkg/React/React');
export interface NestedTextProps {
    nodeData: NestedText;
}
export declare class DocumentContext {
    documentActions: DocumentActions;
    constructor(documentActions?: DocumentActions);
}
export interface DocumentProps extends NestedTextProps, DocumentContext {
}
export declare var NestedTextElem: React.ReactElementFactory<NestedTextProps>;
export declare var NestedTextDocumentElem: React.ReactElementFactory<DocumentProps>;
