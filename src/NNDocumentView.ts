import NestedNodeView = require('./NestedNodeView');
import NNDocumentProps = require('./NNDocumentProps');
import SelectionMode = require('./SelectionMode');
import React = require('pkg/React/React');
import dom = React.DOM;


module NNDocumentView {

    export interface Props<D> extends NestedNodeView.Context<D> {
        nestedNodeViewComponent: NestedNodeView.ComponentClass<D>;
    }


    export class Component<D> extends React.Component<Props<D>, {}, {}> {

        // без этой декларации getChildContext() бросит исключение
        static childContextTypes = new NestedNodeView.Context();

        getChildContext() {
            return new NestedNodeView.Context<D>(this.props.documentActions, this.props.documentProps);
        }

        render() {
            return (
                dom['div'](
                    {
                        tabIndex: 1,
                        className: 'nn_ctx',
                        onKeyDown: this.handleKeyDown.bind(this),
                        onFocus: this.handleFocus.bind(this),
                        onBlur: this.handleBlur.bind(this)
                    },
                    React.createElement<NestedNodeView.Props<D>>(
                        this.props.nestedNodeViewComponent,
                        { node: this.props.documentProps.node }
                    )
                )
            )
        }

        handleKeyDown(e) {
            var actions = this.props.documentActions;

            var keyCode = { //todo something
                LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40,
                TAB: 9, RETURN: 13, DELETE: 46,
                X: 88, C: 67, V: 86,
                Z: 90, Y: 89,
                F2: 113, ESCAPE: 27
            };
            var code = e.keyCode;
            var editMode = this.props.documentProps.editMode;

            var eventHandled = (() => { switch (true) {

                // * Edit Mode

                case editMode && code == keyCode.RETURN:
                case editMode && code == keyCode.ESCAPE:
                    actions.exitEditMode();
                    return true;

                case editMode:
                    return false;

                // * Normal Mode

                case code == keyCode.F2:
                    actions.enterEditMode();
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

                case code == keyCode.Z && e.metaKey && e.shiftKey:
                case code == keyCode.Y && e.metaKey:
                    actions.redo();
                    return true;

                case code == keyCode.Z && e.metaKey:
                    actions.undo();
                    return true;

            }})();

            if (eventHandled) {
                e.preventDefault();
            }

        }


        private documentFocused = false;

        componentDidMount() {
            React.findDOMNode(this).focus();
        }

        componentDidUpdate(props, state, context) {
            this.restoreFocus();
        }

        handleFocus() {
            var domNode = React.findDOMNode(this);
            domNode.classList.add('focused');
            this.documentFocused = true;
        }

        handleBlur() {
            var domNode = React.findDOMNode(this);
            domNode.classList.remove('focused');
            this.documentFocused = false;
        }

        private restoreFocus() {
            // нужно вернуть фокус документу после выхода из режима редактирования
            if (! (this.props.documentProps.editMode || this.documentFocused)) {
                React.findDOMNode(this).focus();
            }
        }

    }


    export function Element<D>(props: Props<D>): React.ReactElement {
        return React.createElement(Component, props);
    }

}


export = NNDocumentView;
