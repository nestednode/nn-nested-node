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
    }


    export class Context<D> { constructor(
        public documentActions: NNDocumentActions<D> = React.PropTypes.any,
        public documentProps: NNDocumentProps<D> = React.PropTypes.any
    ){} }



    export interface ComponentClass<D> {
        new (props: Props<D>, context: Context<D>): Component<D>;
    }

    export class Component<D> extends React.Component<Props<D>, {}, Context<D>> {

        // без этой декларации this.context будет пустым
        static contextTypes = new Context();

        // без явного определения конструктора, вывод типов сглючит (см. generic_constructor_type__bug в лабах)
        constructor(props: Props<D>, context: Context<D>) {
            super(props, context);
        }

        render() {
            var node = this.props.node;
            return (
                dom['div']({ className: 'nn_node' },
                    dom['div'](
                        {
                            className: 'nn_text' + (node.selected ? ' selected' : ''),
                            onClick: this.handleClick.bind(this)
                            //todo onDblClick -> enterEditMode
                        },
                        this.renderData(node.data, this.context.documentProps.editMode && node.focused)
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

        protected renderNestedElement(node: NestedNodeProps<D>): React.ReactElement {
            var props = { node: node, key: node.id };
            return React.createElement(<ComponentClass<D>> this['constructor'], props);
        }

        protected renderData(data: D, editMode: boolean): /*React.ReactFragment*/ any {
            throw new Error('abstract method');
        }

        protected handleClick(e) {
            var actions = this.context.documentActions;
            var selectionMode =
                e.metaKey ? SelectionMode.Toggle :
                    e.shiftKey ? SelectionMode.Shift : SelectionMode.Reset;
            actions && actions.focusNodeById(this.props.node.id, selectionMode);
        }
    }

}


export = NestedNodeView;
