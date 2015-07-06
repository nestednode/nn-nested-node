import React = require('bower_components/nn-react/React');
import dom = React.DOM;

import NestedNodeProps = require('../NestedNodeProps/NestedNodeProps');
import NNDocumentProps = require('../NestedNodeProps/NNDocumentProps');
import NNDocumentActions = require('../NestedNodeProps/NNDocumentActions');
import SelectionMode = require('../NestedNodeProps/SelectionMode');

import KeyboardUtil = require('./KeyboardUtil');
import KeyMod = KeyboardUtil.KeyMod;


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

        protected render() {
            var node = this.props.node;

            var databoxBemBlock = 'nn__node-databox';
            var databoxCls = [databoxBemBlock];
            node.selected       && databoxCls.push(databoxBemBlock +'_selected');
            this.props.editing  && databoxCls.push(databoxBemBlock + '_editing');

            return (
                dom['div']({ className: 'nn__node' },
                    dom['div'](
                        {
                            tabIndex: 0,
                            ref: 'databox',
                            className: databoxCls.join(' '),
                            onClick: this.handleClick,
                            onDoubleClick: this.handleDoubleClick,
                            onKeyPress: this.handleKeyPress
                        },
                        this.renderData(node.data, this.props.editing)
                    ),
                    dom['div'](
                        {className: 'nn__node-nested'},
                        node.nested ?
                            node.nested.map(nestedNode => this.renderNestedElement(nestedNode)) :
                            false
                    )
                )
            )
        }

        protected componentDidMount() {
            this.checkFocus(false, false);
        }

        protected componentDidUpdate(prevProps: Props<D>, prevState, prevContext) {
            this.checkFocus(prevProps.focused, prevProps.editing);
        }

        private checkFocus(prevFocused, prevEditing) {
            if (this.props.focused && (!prevFocused || !this.props.editing && prevEditing)) {
                React.findDOMNode(this.refs['databox']).focus();
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
            e.stopPropagation();
            if (this.props.editing) {
                return;
            }
            if (this.context.documentProps.editMode) {
                this.context.documentActions.exitEditMode();
            }
            var selectionMode =
                e[KeyMod.CTRL] ? SelectionMode.Toggle :
                    e[KeyMod.SHIFT] ? SelectionMode.Shift : SelectionMode.Reset;
            this.context.documentActions.focusNodeById(this.props.node.id, selectionMode);
        }

        protected handleDoubleClick(e) {
            e.stopPropagation();
            if (this.props.editing) {
                return;
            }
            this.context.documentActions.focusNodeById(this.props.node.id, SelectionMode.Reset);
            this.context.documentActions.enterEditMode();
        }

        protected handleKeyPress(e) { }

    }

}


export = NestedNodeView;
