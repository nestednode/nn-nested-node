import NestedNodeProps = require('./NestedNodeProps');
import NNDocumentActions = require('./NNDocumentActions');
import NNDocumentProps = require('./NNDocumentProps');
import React = require('pkg/React/React');
declare module NestedNodeView {
    interface Props<D> {
        node: NestedNodeProps<D>;
    }
    class Context<D> {
        documentActions: NNDocumentActions;
        documentProps: NNDocumentProps<D>;
        constructor(documentActions?: NNDocumentActions, documentProps?: NNDocumentProps<D>);
    }
    class Component<D> extends React.Component<Props<D>, {}> {
        static contextTypes: Context<{}>;
        context: Context<D>;
        render(): React.ReactElement;
        protected createElement(props: Props<D>): React.ReactElement;
        protected renderData(data: D): any;
        protected handleClick(e: any): void;
    }
}
export = NestedNodeView;
