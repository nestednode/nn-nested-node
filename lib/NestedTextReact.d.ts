import NestedNodeProps = require('./NestedNodeProps');
import DocumentActions = require('./DocumentActions');
import React = require('pkg/React/React');
export interface NodeViewProps<D> {
    node: NestedNodeProps<D>;
}
export declare class DocumentViewContext {
    documentActions: DocumentActions;
    editMode: boolean;
    constructor(documentActions?: DocumentActions, editMode?: boolean);
}
export interface DocumentViewProps<D> extends NodeViewProps<D>, DocumentViewContext {
    nodeViewFactory: React.ReactElementFactory<NodeViewProps<D>>;
}
export declare class NodeViewComp<D> extends React.Component<NodeViewProps<D>, {}> {
    static contextTypes: DocumentViewContext;
    context: DocumentViewContext;
    render(): React.ReactElement;
    protected createElement(props: NodeViewProps<D>): React.ReactElement;
    protected renderData(data: D): any;
    protected handleClick(e: any): void;
}
export declare class DocumentViewComp<D> extends React.Component<DocumentViewProps<D>, any> {
    static childContextTypes: DocumentViewContext;
    constructor(props: any);
    getChildContext(): DocumentViewContext;
    render(): React.ReactElement;
    handleKeyDown(e: any): void;
    handleFocus(e: any): void;
    handleBlur(e: any): void;
}
export declare function DocumentView<D>(props: DocumentViewProps<D>): React.ReactElement;
