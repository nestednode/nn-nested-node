import NestedNodeData = require('./NestedNodeData');
import DocumentActions = require('./DocumentActions');
import React = require('pkg/React/React');
import dom = React.DOM;


declare var require;
require(['pkg/require-css/css!../styles/NestedNodeStyle']);


export interface NestedNodeProps { nodeData: NestedNodeData; }
export interface DocumentContext { documentActions?: DocumentActions; }
export interface DocumentProps extends NestedNodeProps, DocumentContext {}

export var NestedNodeElem = React.createFactory<NestedNodeProps>(NestedNodeComp);
export var NestedNodeDocumentElem = React.createFactory<DocumentProps>(DocumentComp);


class NestedNodeComp extends React.Component<NestedNodeProps, any> {

    context: DocumentContext;

    render() {
        var data = this.props.nodeData;
        return (
            dom['div']({className: 'nn_node', key: data.id},
                dom['div'](
                    {
                        className: ('nn_text' + data.selected ? ' selected' : ''),
                        onClick: this.handleClick.bind(this)
                    },
                    data.text
                ),
                dom['div'](
                    {className: 'nn_nested'},
                    data.map(nestedData => NestedNodeElem({nodeData: nestedData}))
                )
            )
        )
    }

    handleClick() {
        var actions = this.context.documentActions;
        actions && actions.focusNodeById(this.props.nodeData.id);
    }
}


class DocumentComp extends React.Component<DocumentProps, any> {

    getChildContext(): DocumentContext {
        return { documentActions: this.props.documentActions };
    }

    render() {
        return (
            dom['div'](
                { className: 'nn_ctx' },
                NestedNodeElem({ nodeData: this.props.nodeData })
            )
        )
    }
}

