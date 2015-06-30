import React = require('pkg/React/React');
import NestedNodeView = require('./NestedNodeView');
declare module NNDocumentView {
    interface Props<D> extends NestedNodeView.Context<D> {
        nestedNodeViewComponent: NestedNodeView.ComponentClass<D>;
        maxNodeViewBoxWidth?: number;
    }
    class Component<D> extends React.Component<Props<D>, {}, {}> {
        static childContextTypes: NestedNodeView.Context<{}>;
        static defaultProps: {
            maxNodeViewBoxWidth: number;
        };
        constructor(props: Props<D>, context: any);
        protected getChildContext(): NestedNodeView.Context<D>;
        protected render(): React.ReactElement;
        private handleKeyDown(e);
        private prevFocusedElem;
        private handleClick();
        private handleFocus(e);
        private handleBlur();
        private prevContentElemSize;
        protected componentDidMount(): void;
        protected componentDidUpdate(): void;
        private getElemByRef(ref);
        private adjustWidth(wrapperElem, contentElem);
    }
    function Element<D>(props: Props<D>): React.ReactElement;
}
export = NNDocumentView;
