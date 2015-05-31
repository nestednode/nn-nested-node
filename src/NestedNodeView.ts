import NestedNodeProps = require('./NestedNodeProps');
import NNDocumentActions = require('./NNDocumentActions');
import NNDocumentProps = require('./NNDocumentProps');
import SelectionMode = require('./SelectionMode');
import React = require('pkg/React/React');
import dom = React.DOM;


// если не обернуть в модуль, любимая ide будет считать что, например,
// Props из этого модуля, и Props из модуля NNDocumentView - это partial-определения одного общего интерфейса

module NestedNodeView {

    export interface Props<D> {
        node: NestedNodeProps<D>;
    }


    export class Context<D> { constructor(
        public documentActions: NNDocumentActions = React.PropTypes.any,
        public documentProps: NNDocumentProps<D> = React.PropTypes.any
    ){} }


    export class Component<D> extends React.Component<Props<D>, {}> {

        // без этой декларации this.context будет пустым
        static contextTypes = new Context();

        context: Context<D>;

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
                        this.renderData(node.data)
                    ),
                    dom['div'](
                        {className: 'nn_nested'},
                        node.nested ?
                            node.nested.map(nestedNode => this.createElement({ node: nestedNode, key: nestedNode.id })) :
                            false
                    )
                )
            )
        }

        protected createElement(props: Props<D>): React.ReactElement {
            throw new Error('abstract method');
        }

        protected renderData(data: D): /*React.ReactElement*/ any {
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
