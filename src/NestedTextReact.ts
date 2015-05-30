import NestedNodeProps = require('./NestedNodeProps');
import TextData = require('./TextData');
import DocumentActions = require('./DocumentActions');
import SelectionMode = require('./SelectionMode');


import React = require('pkg/React/React');
import dom = React.DOM;


declare var require;
require(['pkg/require-css/css!../styles/NestedNodeStyle']);


// * Props and Context

export interface NodeViewProps<D> {
    node: NestedNodeProps<D>;
}

export class DocumentViewContext { constructor(
    public documentActions: DocumentActions = React.PropTypes.any,
    public editMode: boolean = React.PropTypes.any
){} }


export interface DocumentViewProps<D> extends NodeViewProps<D>, DocumentViewContext {
    nodeViewFactory: React.ReactElementFactory<NodeViewProps<D>>
}


// * Components

//export var NestedTextNodeViewElem: React.ReactElementFactory<NodeViewProps<TextData>>;

export class NodeViewComp<D> extends React.Component<NodeViewProps<D>, {}> {

    //static factory = React.createFactory<NodeViewProps<D>>(NodeViewComp);

    // без этой декларации this.context будет пустым
    static contextTypes = new DocumentViewContext();

    context: DocumentViewContext;

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

    protected createElement(props: NodeViewProps<D>): React.ReactElement {
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

//NestedTextNodeViewElem = React.createFactory<NodeViewProps>(NodeViewComp);



export class DocumentViewComp<D> extends React.Component<DocumentViewProps<D>, any> {

    // без этой декларации getChildContext() бросит исключение
    static childContextTypes = new DocumentViewContext();

    constructor(props) {
        super(props);
        this.state = {
            focused: false
        };
    }

    getChildContext() {
        return new DocumentViewContext(this.props.documentActions, this.props.editMode);
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
                this.props.nodeViewFactory({ node: this.props.node })
            )
        )
    }

    handleKeyDown(e) {
        var actions = this.props.documentActions;

        if (! actions) {
            return;
        }

        //todo something
        var keyCode = {
            LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40,
            TAB: 9, RETURN: 13, DELETE: 46,
            X: 88, C: 67, V: 86,
            Z: 90, Y: 89,
            SPACE: 32, ESCAPE: 27
        };
        var code = e.keyCode;

        var eventHandled = (() => { switch (true) {

            case code == keyCode.SPACE:
                actions.enterEditMode();
                return true;

            case code == keyCode.ESCAPE:
                actions.exitEditMode();
                return true;

            // todo нужна функция, которая бы проверяла, что нажат исключительно указанный модификатор
            // а то это лажа какая-то
            case code == keyCode.LEFT && e.altKey:
            case code == keyCode.LEFT && e.shiftKey:
                return false;
            case code == keyCode.LEFT:
                actions.focusParentNode();
                return true;

            case code == keyCode.RIGHT && e.altKey:
            case code == keyCode.RIGHT && e.shiftKey:
                return false;
            case code == keyCode.RIGHT:
                actions.focusNestedNode();
                return true;

            case code == keyCode.UP && e.altKey:
                actions.moveNodeBackward();
                return true;
            case code == keyCode.UP && e.shiftKey:
                actions.focusPrevNode(SelectionMode.Shift);
                return true;
            case code == keyCode.UP:
                actions.focusPrevNode(SelectionMode.Reset);
                return true;

            case code == keyCode.DOWN && e.altKey:
                actions.moveNodeForward();
                return true;
            case code == keyCode.DOWN && e.shiftKey:
                actions.focusNextNode(SelectionMode.Shift);
                return true;
            case code == keyCode.DOWN:
                actions.focusNextNode(SelectionMode.Reset);
                return true;

            case code == keyCode.TAB && e.shiftKey:
                actions.envelopeNode();
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

            case code == keyCode.C && e.metaKey:
                actions.copyToClipboard();
                return true;

            case code == keyCode.X && e.metaKey:
                actions.cutToClipboard();
                return true;

            case code == keyCode.V && e.metaKey:
                actions.pasteFromClipboard();
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

export function DocumentView<D>(props: DocumentViewProps<D>): React.ReactElement {
    return React.createElement<DocumentViewProps<D>>(DocumentViewComp, props);
}
