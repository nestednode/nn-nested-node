import NestedNodeView = require('./NestedNodeView');
import React = require('pkg/React/React');
declare module NNDocumentView {
    interface Props<D> extends NestedNodeView.Context<D> {
        nestedNodeViewComponent: NestedNodeView.ComponentClass<D>;
    }
    interface State {
        focused: boolean;
    }
    class Component<D> extends React.Component<Props<D>, State> {
        static childContextTypes: NestedNodeView.Context<{}>;
        constructor(props: Props<D>);
        getChildContext(): NestedNodeView.Context<D>;
        render(): React.ReactElement;
        handleKeyDown(e: any): void;
        handleFocus(e: any): void;
        handleBlur(e: any): void;
    }
    function Element<D>(props: Props<D>): React.ReactElement;
}
export = NNDocumentView;
