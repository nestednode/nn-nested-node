import NestedNodeView = require('./NestedNodeView');
import React = require('pkg/React/React');
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
        getChildContext(): NestedNodeView.Context<D>;
        render(): React.ReactElement;
        handleKeyDown(e: any): void;
        handleFocus(): void;
        handleBlur(): void;
        private prevContentSize;
        componentDidMount(): void;
        componentDidUpdate(): void;
        protected getElemByRef(ref: string): HTMLElement;
        private adjustWidth(wrapperElem, contentElem);
    }
    function Element<D>(props: Props<D>): React.ReactElement;
}
export = NNDocumentView;
