import React = require('bower_components/nn-react/React');
import NestedNodeProps = require('../NestedNodeProps/NestedNodeProps');
import NNDocumentProps = require('../NestedNodeProps/NNDocumentProps');
import NNDocumentActions = require('../NestedNodeProps/NNDocumentActions');
declare module NestedNodeView {
    interface Props<D> {
        node: NestedNodeProps<D>;
        editing: boolean;
        focused: boolean;
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
        protected render(): React.ReactElement;
        protected componentDidMount(): void;
        protected componentDidUpdate(prevProps: Props<D>, prevState: any, prevContext: any): void;
        private checkFocus(prevFocused, prevEditing);
        protected renderNestedElement(node: NestedNodeProps<D>): React.ReactElement;
        protected renderData(data: D, editMode: boolean): any;
        protected handleClick(e: any): void;
        protected handleDoubleClick(e: any): void;
        protected handleKeyPress(e: any): void;
    }
}
export = NestedNodeView;
