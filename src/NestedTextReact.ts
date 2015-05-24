import NestedText = require('./NestedText');
import DocumentActions = require('./DocumentActions');
import SelectionMode = require('./SelectionMode');
import Collection = require('pkg/Collection/Collection');


import React = require('pkg/React/React');
import dom = React.DOM;


declare var require;
require(['pkg/require-css/css!../styles/NestedNodeStyle']);


// * Props and Context

export interface NestedTextProps {
    nodeData: NestedText;
}

export class DocumentContext { constructor(
    public documentActions: DocumentActions = React.PropTypes.any
){} }


export interface DocumentProps extends NestedTextProps, DocumentContext {

}


// * Components

export var NestedTextElem: React.ReactElementFactory<NestedTextProps>;

class NestedTextComp extends React.Component<NestedTextProps, any> {

    // без этой декларации this.context будет пустым
    static contextTypes = new DocumentContext();

    context: DocumentContext;

    render() {
        var data = this.props.nodeData;
        var owner = data.owner;
        return (
            dom['div']({ className: 'nn_node' },
                dom['div'](
                    {
                        className: 'nn_text' + (owner && owner.selected ? ' selected' : ''),
                        onClick: this.handleClick.bind(this)
                    },
                    data.text
                ),
                dom['div'](
                    {className: 'nn_nested'},
                    data.nested ?
                        data.nested.map((nestedData, key) => NestedTextElem({ nodeData: nestedData, key: key })) :
                        false
                )
            )
        )
    }

    handleClick(e) {
        var actions = this.context.documentActions;
        var owner = this.props.nodeData.owner;
        var selectionMode =
            e.metaKey ? SelectionMode.Toggle :
                e.shiftKey ? SelectionMode.Shift : SelectionMode.Reset;
        actions && owner && actions.focusNodeById(owner.id, selectionMode);
    }
}

NestedTextElem = React.createFactory<NestedTextProps>(NestedTextComp);



class NestedTextDocumentComp extends React.Component<DocumentProps, any> {

    // без этой декларации getChildContext() бросит исключение
    static childContextTypes = new DocumentContext();

    constructor(props) {
        super(props);
        this.state = {
            focused: false
        };
    }

    getChildContext() {
        return new DocumentContext(this.props.documentActions);
    }

    render() {
        return (
            dom['div'](
                {
                    tabIndex: 1,
                    className: 'nn_ctx' + (this.state.focused ? ' focused' : ''),
                    onKeyDown: this.handleKeyDown.bind(this),
                    onFocus: this.handleFocus.bind(this),
                    onBlur: this.handleBlur.bind(this)
                },
                NestedTextElem({ nodeData: this.props.nodeData })
            )
        )
    }

    componentDidMount() {
        //var domNode = React.findDOMNode(this);
        //domNode.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    //todo unmount

    handleKeyDown(e) {
        var actions = this.props.documentActions;

        if (! actions) {
            return;
        }

        //todo something
        var keyCode = {
            LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40,
            TAB: 9, RETURN: 13, DELETE: 46,
            Y: 89, Z: 90
        };
        var code = e.keyCode;

        var eventHandled = (() => { switch (true) {

            case code == keyCode.LEFT && e.shiftKey:
                return false;
            case code == keyCode.LEFT:
                actions.focusParentNode();
                return true;

            case code == keyCode.RIGHT && e.shiftKey:
                return false;
            case code == keyCode.RIGHT:
                actions.focusNestedNode();
                return true;

            case code == keyCode.UP && e.shiftKey:
                actions.focusPrevNode(SelectionMode.Shift);
                return true;
            case code == keyCode.UP:
                actions.focusPrevNode(SelectionMode.Reset);
                return true;

            case code == keyCode.DOWN && e.shiftKey:
                actions.focusNextNode(SelectionMode.Shift);
                return true;
            case code == keyCode.DOWN:
                actions.focusNextNode(SelectionMode.Reset);
                return true;

            case code == keyCode.TAB:
                actions.insertNewNode();
                return true;

            case code == keyCode.RETURN && e.shiftKey:
                actions.appendNewNodeBefore();
                return true;

            case code == keyCode.RETURN:
                actions.appendNewNodeAfter();
                return true;

            case code == keyCode.DELETE:
                actions.removeNode();
                return true;

            case code == keyCode.Z && e.metaKey:
                actions.undo();
                return true;

            case code == keyCode.Y && e.metaKey:
                actions.redo();
                return true;

        }})();

        if (eventHandled) {
            e.preventDefault();
        }

    }

    handleFocus(e) {
        this.setState({ focused: true });
    }

    handleBlur(e) {
        this.setState({ focused: false });
    }
}

export var NestedTextDocumentElem = React.createFactory<DocumentProps>(NestedTextDocumentComp);
