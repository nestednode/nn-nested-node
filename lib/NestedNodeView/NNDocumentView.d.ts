import React = require('bower_components/nn-react/React');
import NestedNodeView = require('./NestedNodeView');
declare module NNDocumentView {
    interface Props<D> extends NestedNodeView.Context<D> {
        nestedNodeViewComponent: NestedNodeView.ComponentClass<D>;
        nodeViewBoxMaxWidth?: number;
        styleMods?: {};
    }
    class Component<D> extends React.Component<Props<D>, {}, {}> {
        static childContextTypes: NestedNodeView.Context<{}>;
        static defaultProps: {
            nodeViewBoxMaxWidth: number;
        };
        constructor(props: Props<D>, context: any);
        protected getChildContext(): NestedNodeView.Context<D>;
        protected render(): React.ReactElement;
        private handleKeyDown(e);
        private prevFocusedElem;
        private handleClick(e);
        private handleFocus(e);
        private handleBlur();
        protected componentDidMount(): void;
        protected componentDidUpdate(): void;
        private adjustWidthAndScroll();
        private getElemByRef(ref);
    }
    function Element<D>(props: Props<D>): React.ReactElement;
}
export = NNDocumentView;
