import NestedNodeProps = require('./NestedNodeProps');
import NNDocumentActions = require('./NNDocumentActions');
import NNDocumentProps = require('./NNDocumentProps');
import SelectionMode = require('./SelectionMode');
import React = require('pkg/React/React');
import dom = React.DOM;


// если не обернуть в модуль, ide будет считать, например,
// что Props из этого модуля, и Props из модуля NNDocumentView - это partial-определения одного общего интерфейса

module NestedNodeView {

    export interface Props<D> {
        node: NestedNodeProps<D>;
        editing: boolean;
        focused: boolean;
    }


    export class Context<D> { constructor(
        public documentActions: NNDocumentActions<D> = React.PropTypes.any,
        public documentProps: NNDocumentProps<D> = React.PropTypes.any
    ){} }



    export interface ComponentClass<D> {
        new (props: Props<D>, context: Context<D>): Component<D>;
    }

    export /*abstract*/ class Component<D> extends React.Component<Props<D>, {}, Context<D>> {

        // без этой декларации this.context будет пустым
        static contextTypes = new Context();

        // без явного определения конструктора, вывод типов сглючит (см. generic_constructor_type__bug в лабах)
        constructor(props: Props<D>, context: Context<D>) {
            super(props, context);
            this.handleClick = this.handleClick.bind(this);
            this.handleDoubleClick = this.handleDoubleClick.bind(this);
            this.handleKeyPress = this.handleKeyPress.bind(this);
        }

        render() {
            var node = this.props.node;
            return (
                dom['div']({ className: 'nn_node' },
                    dom['div'](
                        {
                            tabIndex: 0,
                            ref: 'data',
                            className: 'nn_data' + (node.selected ? ' selected' : ''),
                            onClick: this.handleClick,
                            onDoubleClick: this.handleDoubleClick,
                            onKeyPress: this.handleKeyPress
                        },
                        this.renderData(node.data, this.props.editing)
                    ),
                    dom['div'](
                        {className: 'nn_nested'},
                        node.nested ?
                            node.nested.map(nestedNode => this.renderNestedElement(nestedNode)) :
                            false
                    )
                )
            )
        }

        componentDidMount() {
            this.checkFocus(false, false);
        }

        componentDidUpdate(prevProps: Props<D>, prevState, prevContext) {
            this.checkFocus(prevProps.focused, prevProps.editing);
        }

        private checkFocus(prevFocused, prevEditing) {
            if (this.props.focused && (!prevFocused || !this.props.editing && prevEditing)) {
                React.findDOMNode(this.refs['data']).focus();
            }
        }

        protected renderNestedElement(node: NestedNodeProps<D>): React.ReactElement {
            var props = {
                node: node,
                focused: node.focused, //чтобы можно было сравнивать изменения при update
                editing: this.context.documentProps.editMode && node.focused,
                key: node.id
            };
            return React.createElement<Props<D>>(<ComponentClass<D>> this['constructor'], props);
        }

        /*abstract*/
        protected renderData(data: D, editMode: boolean): /*React.ReactFragment*/ any {
            throw new Error('abstract method');
        }

        protected handleClick(e) {
            var selectionMode =
                e.metaKey ? SelectionMode.Toggle :
                    e.shiftKey ? SelectionMode.Shift : SelectionMode.Reset;
            this.context.documentActions.focusNodeById(this.props.node.id, selectionMode);
        }

        protected handleDoubleClick(e) {
            if (! this.props.editing) {
                this.context.documentActions.focusNodeById(this.props.node.id, SelectionMode.Reset);
                this.context.documentActions.enterEditMode();
            }
        }

        protected handleKeyPress(e) { }

    }

}


export = NestedNodeView;
