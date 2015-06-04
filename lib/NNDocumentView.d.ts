import NestedNodeView = require('./NestedNodeView');
import React = require('pkg/React/React');
declare module NNDocumentView {
    interface Props<D> extends NestedNodeView.Context<D> {
        nestedNodeViewComponent: NestedNodeView.ComponentClass<D>;
    }
    class Component<D> extends React.Component<Props<D>, {}, {}> {
        static childContextTypes: NestedNodeView.Context<{}>;
        getChildContext(): NestedNodeView.Context<D>;
        render(): React.ReactElement;
        handleKeyDown(e: any): void;
        handleFocus(): void;
        handleBlur(): void;
    }
    function Element<D>(props: Props<D>): React.ReactElement;
}
export = NNDocumentView;
