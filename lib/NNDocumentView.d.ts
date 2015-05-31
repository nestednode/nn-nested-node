import NestedNodeView = require('./NestedNodeView');
import React = require('pkg/React/React');
export interface Props<D> extends NestedNodeView.Context<D> {
    nodeViewFactory: React.ReactElementFactory<NestedNodeView.Props<D>>;
}
export interface State {
    focused: boolean;
}
export declare class Component<D> extends React.Component<Props<D>, State> {
    static childContextTypes: NestedNodeView.Context<{}>;
    constructor(props: any);
    getChildContext(): NestedNodeView.Context<D>;
    render(): React.ReactElement;
    handleKeyDown(e: any): void;
    handleFocus(e: any): void;
    handleBlur(e: any): void;
}
export declare function Element<D>(props: Props<D>): React.ReactElement;
