import NestedNodeView = require('./NestedNodeView');
import NNDocumentProps = require('./NNDocumentProps');
import SelectionMode = require('./SelectionMode');
import KeyboardUtil = require('./KeyboardUtil');
import KeyCode = KeyboardUtil.KeyCode;
import React = require('pkg/React/React');
import dom = React.DOM;


module NNDocumentView {

    export interface Props<D> extends NestedNodeView.Context<D> {
        nestedNodeViewComponent: NestedNodeView.ComponentClass<D>;
    }


    export class Component<D> extends React.Component<Props<D>, {}, {}> {

        // без этой декларации getChildContext() бросит исключение
        static childContextTypes = new NestedNodeView.Context();

        constructor(props: Props<D>, context) {
            super(props, context);
            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleFocus = this.handleFocus.bind(this);
            this.handleBlur = this.handleBlur.bind(this);
        }

        getChildContext() {
            return new NestedNodeView.Context<D>(this.props.documentActions, this.props.documentProps);
        }

        render() {
            var node = this.props.documentProps.node;
            return (
                dom['div']({ className: 'nn_document_scrollbox'},
                    dom['div']({ className: 'nn_document_container'},
                        dom['div'](
                            {
                                //tabIndex: 0,
                                className: 'nn_document',
                                onKeyDown: this.handleKeyDown,
                                onFocus: this.handleFocus,
                                onBlur: this.handleBlur
                            },
                            React.createElement<NestedNodeView.Props<D>>(
                                this.props.nestedNodeViewComponent,
                                {
                                    node: node,
                                    focused: node.focused,
                                    editing: this.props.documentProps.editMode && node.focused
                                }
                            )
                        )
                    )
                )
            )
        }

        handleKeyDown(e) {
            var actions = this.props.documentActions;
            var editMode = this.props.documentProps.editMode;
            var shortcut = new KeyboardUtil.Shortcut(e);

            var eventHandled = (() => { switch (true) {

                // * Edit Mode

                case editMode && shortcut.eq(KeyCode.ESCAPE):
                    var undoChanges;
                    actions.exitEditMode(undoChanges=true);
                    return true;

                case editMode && shortcut.eq(KeyCode.RETURN):
                    actions.exitEditMode();
                    return true;

                case editMode:
                    return false;

                // * Normal Mode

                case shortcut.eq(KeyCode.F2):
                    actions.enterEditMode();
                    return true;


                case shortcut.eq(KeyCode.LEFT):
                    actions.focusParentNode();
                    return true;

                case shortcut.eq(KeyCode.RIGHT):
                    actions.focusNestedNode();
                    return true;

                case shortcut.eq(KeyCode.UP):
                    actions.focusPrevNode(SelectionMode.Reset);
                    return true;

                case shortcut.eq(KeyCode.UP, 'shiftKey'):
                    actions.focusPrevNode(SelectionMode.Shift);
                    return true;

                case shortcut.eq(KeyCode.DOWN):
                    actions.focusNextNode(SelectionMode.Reset);
                    return true;

                case shortcut.eq(KeyCode.DOWN, 'shiftKey'):
                    actions.focusNextNode(SelectionMode.Shift);
                    return true;


                case shortcut.eq(KeyCode.TAB):
                    actions.insertNewNode();
                    return true;

                case shortcut.eq(KeyCode.TAB, 'shiftKey'):
                    actions.envelopeNode();
                    return true;

                case shortcut.eq(KeyCode.RETURN):
                    actions.appendNewNodeAfter();
                    return true;

                case shortcut.eq(KeyCode.RETURN, 'shiftKey'):
                    actions.appendNewNodeBefore();
                    return true;


                case shortcut.eq(KeyCode.UP, 'altKey'):
                    actions.moveNodeBackward();
                    return true;

                case shortcut.eq(KeyCode.DOWN, 'altKey'):
                    actions.moveNodeForward();
                    return true;


                case shortcut.eq(KeyCode.DELETE):
                    actions.removeNode();
                    return true;


                case shortcut.eq(KeyCode.C, 'metaKey'):
                    actions.copyToClipboard();
                    return true;

                case shortcut.eq(KeyCode.X, 'metaKey'):
                    actions.cutToClipboard();
                    return true;

                case shortcut.eq(KeyCode.V, 'metaKey'):
                    actions.pasteFromClipboard();
                    return true;


                case shortcut.eq(KeyCode.Z, 'metaKey'):
                    actions.undo();
                    return true;

                case shortcut.eq(KeyCode.Z, 'metaKey', 'shiftKey'):
                case shortcut.eq(KeyCode.Y, 'metaKey'):
                    actions.redo();
                    return true;


                default:
                    return false;

            }})();

            if (eventHandled) {
                e.preventDefault();
            }

        }


        handleFocus() {
            var domNode = React.findDOMNode(this);
            domNode.classList.add('focused');
        }

        handleBlur() {
            var domNode = React.findDOMNode(this);
            domNode.classList.remove('focused');
        }

    }


    export function Element<D>(props: Props<D>): React.ReactElement {
        return React.createElement(Component, props);
    }

}


export = NNDocumentView;
