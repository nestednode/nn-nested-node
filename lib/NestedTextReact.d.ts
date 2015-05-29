import NestedNodeProps = require('./NestedNodeProps');
import TextData = require('./TextData');
import DocumentActions = require('./DocumentActions');
import React = require('pkg/React/React');
export interface NestedTextProps {
    node: NestedNodeProps<TextData>;
}
export declare class DocumentContext {
    documentActions: DocumentActions;
    constructor(documentActions?: DocumentActions);
}
export interface DocumentProps extends NestedTextProps, DocumentContext {
}
export declare var NestedTextElem: React.ReactElementFactory<NestedTextProps>;
export declare var NestedTextDocumentElem: React.ReactElementFactory<DocumentProps>;
