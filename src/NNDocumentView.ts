import NestedNodeView = require('./NestedNodeView');
import NNDocumentProps = require('./NNDocumentProps');
import SelectionMode = require('./SelectionMode');
import React = require('pkg/React/React');
import dom = React.DOM;


module NNDocumentView {

    export interface Props<D> extends NestedNodeView.Context<D> {
        nodeViewFactory: React.ReactElementFactory<NestedNodeView.Props<D>>
    }


    export interface State {
        focused: boolean;
    }


    export class Component<D> extends React.Component<Props<D>, State> {

        // без этой декларации getChildContext() бросит исключение
        static childContextTypes = new NestedNodeView.Context();

        constructor(props) {
            super(props);
            this.state = {
                focused: false
            };
        }

        getChildContext() {
            return new NestedNodeView.Context<D>(this.props.documentActions, this.props.documentProps);
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
                    this.props.nodeViewFactory({ node: this.props.documentProps.node })
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


    export function Element<D>(props: Props<D>): React.ReactElement {
        return React.createElement(Component, props);
    }

}


export = NNDocumentView;
