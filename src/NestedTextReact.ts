import NestedText = require('./NestedText');
import DocumentActions = require('./DocumentActions');
import React = require('pkg/React/React');
import dom = React.DOM;


declare var require;
require(['pkg/require-css/css!../styles/NestedNodeStyle']);


export interface NestedTextProps { nodeData: NestedText; }
export interface DocumentContext { documentActions?: DocumentActions; }
export interface DocumentProps extends NestedTextProps, DocumentContext {}

export var NestedTextElem = React.createFactory<NestedTextProps>(NestedTextComp);
export var NestedTextDocumentElem = React.createFactory<DocumentProps>(NestedTextDocumentComp);


class NestedTextComp extends React.Component<NestedTextProps, any> {

    context: DocumentContext;

    render() {
        var data = this.props.nodeData;
        return (
            dom['div']({className: 'nn_node', key: data.id},
                dom['div'](
                    {
                        className: 'nn_text' + (data.owner && data.owner.selected ? ' selected' : ''),
                        onClick: this.handleClick.bind(this)
                    },
                    data.text
                ),
                dom['div'](
                    {className: 'nn_nested'},
                    data.nested ?
                        data.nested.map(nestedData => NestedTextElem({ nodeData: nestedData })) :
                        false
                )
            )
        )
    }

    handleClick() {
        var actions = this.context.documentActions;
        actions && actions.focusNodeById(this.props.nodeData.id);
    }
}


class NestedTextDocumentComp extends React.Component<DocumentProps, any> {

    getChildContext(): DocumentContext {
        return { documentActions: this.props.documentActions };
    }

    render() {
        return (
            dom['div'](
                { className: 'nn_ctx' },
                NestedTextElem({ nodeData: this.props.nodeData })
            )
        )
    }
}

