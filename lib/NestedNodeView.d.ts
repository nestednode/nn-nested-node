import NestedNodeProps = require('./NestedNodeProps');
import NNDocumentActions = require('./NNDocumentActions');
import NNDocumentProps = require('./NNDocumentProps');
import React = require('pkg/React/React');
declare module NestedNodeView {
    interface Props<D> {
        node: NestedNodeProps<D>;
    }
    class Context<D> {
        documentActions: NNDocumentActions<D>;
        documentProps: NNDocumentProps<D>;
        constructor(documentActions?: NNDocumentActions<D>, documentProps?: NNDocumentProps<D>);
    }
    interface ComponentClass<D> {
        new (props: Props<D>, context: Context<D>): Component<D>;
    }
    class Component<D> extends React.Component<Props<D>, {}, Context<D>> {
        static contextTypes: Context<{}>;
        constructor(props: Props<D>, context: Context<D>);
        render(): React.ReactElement;
        protected renderNestedElement(node: NestedNodeProps<D>): React.ReactElement;
        protected renderData(data: D, editMode: boolean): any;
        protected handleClick(e: any): void;
    }
}
export = NestedNodeView;
