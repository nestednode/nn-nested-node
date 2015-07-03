import React = require('pkg/React/React');
import dom = React.DOM;

import NNDocumentProps = require('../NestedNodeProps/NNDocumentProps');
import SelectionMode = require('../NestedNodeProps/SelectionMode');

import NestedNodeView = require('./NestedNodeView');
import KeyboardUtil = require('./KeyboardUtil');
import KeyCode = KeyboardUtil.KeyCode;
import KeyMod = KeyboardUtil.KeyMod;


module NNDocumentView {

    export interface Props<D> extends NestedNodeView.Context<D> {
        nestedNodeViewComponent: NestedNodeView.ComponentClass<D>;
        maxNodeViewBoxWidth?: number;
        styleMods? : {}
    }


    export class Component<D> extends React.Component<Props<D>, {}, {}> {

        // без этой декларации getChildContext() бросит исключение
        static childContextTypes = new NestedNodeView.Context();

        static defaultProps = {
            maxNodeViewBoxWidth: 400
        };

        constructor(props: Props<D>, context) {
            super(props, context);
            this.handleKeyDown = this.handleKeyDown.bind(this);
            this.handleFocus = this.handleFocus.bind(this);
            this.handleBlur = this.handleBlur.bind(this);
            this.handleClick = this.handleClick.bind(this);
        }

        protected getChildContext() {
            return new NestedNodeView.Context<D>(this.props.documentActions, this.props.documentProps);
        }

        protected render() {
            var node = this.props.documentProps.content;
            return (
                dom['div']({
                        className: 'nn' + stringifyMods('nn', this.props.styleMods),
                        //tabIndex: 0, фокус получают конкрентые узлы,
                        // чтобы, в зависимости от реализации, по-своему реагировать на клавиши
                        onKeyDown: this.handleKeyDown,
                        onFocus: this.handleFocus,
                        onBlur: this.handleBlur,
                        onClick: this.handleClick
                    },
                    dom['div']({ className: 'nn__doc-scrollbox'},
                        dom['div']({ ref: 'wrapper', className: 'nn__doc-wrapper'},
                            dom['div'](
                                {
                                    ref: 'content',
                                    className: 'nn__doc-content'
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
            )
        }

        private handleKeyDown(e) {
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

                case shortcut.eq(KeyCode.UP, KeyMod.SHIFT):
                    actions.focusPrevNode(SelectionMode.Shift);
                    return true;

                case shortcut.eq(KeyCode.DOWN):
                    actions.focusNextNode(SelectionMode.Reset);
                    return true;

                case shortcut.eq(KeyCode.DOWN, KeyMod.SHIFT):
                    actions.focusNextNode(SelectionMode.Shift);
                    return true;

                case shortcut.eq(KeyCode.A, KeyMod.CTRL):
                    actions.selectNodeSiblings();
                    return true;


                case shortcut.eq(KeyCode.TAB):
                    actions.insertNewNode();
                    return true;

                case shortcut.eq(KeyCode.TAB, KeyMod.SHIFT):
                    actions.envelopeNode();
                    return true;

                case shortcut.eq(KeyCode.RETURN):
                    actions.appendNewNodeAfter();
                    return true;

                case shortcut.eq(KeyCode.RETURN, KeyMod.SHIFT):
                    actions.appendNewNodeBefore();
                    return true;


                case shortcut.eq(KeyCode.D, KeyMod.CTRL):
                    actions.duplicateNode();
                    return true;


                case shortcut.eq(KeyCode.UP, KeyMod.ALT):
                    actions.moveNodeBackward();
                    return true;

                case shortcut.eq(KeyCode.DOWN, KeyMod.ALT):
                    actions.moveNodeForward();
                    return true;


                case shortcut.eq(KeyCode.DELETE):
                case shortcut.eq(KeyCode.BACK_SPACE):
                    actions.removeNode();
                    return true;


                case shortcut.eq(KeyCode.C, KeyMod.CTRL):
                    actions.copyToClipboard();
                    return true;

                case shortcut.eq(KeyCode.X, KeyMod.CTRL):
                    actions.cutToClipboard();
                    return true;

                case shortcut.eq(KeyCode.V, KeyMod.CTRL):
                    actions.pasteFromClipboard();
                    return true;


                case shortcut.eq(KeyCode.Z, KeyMod.CTRL):
                    actions.undo();
                    return true;

                case shortcut.eq(KeyCode.Z, KeyMod.CTRL, KeyMod.SHIFT):
                case shortcut.eq(KeyCode.Y, KeyMod.CTRL):
                    actions.redo();
                    return true;


                default:
                    return false;

            }})();

            if (eventHandled) {
                e.preventDefault();
            }

        }

        private prevFocusedElem: HTMLElement;

        private handleClick() {
            // click по редактируемой части узла до сюда не всплывет,
            // сюда событие доходит, только если щелчек был на пустом месте,
            // а в таком случае фокус не должен сбиваться,
            // но т.к. пердотвратить сброс фокуса нельзя (preventDefault не поможет),
            // приходтся заново фокусировать заранее сохраненный prevFocusedElem
            // (побочным эффектом будет автоматическая прокрутка к этому узлу, увы)
            if (this.prevFocusedElem) {
                this.prevFocusedElem.focus();
            }
        }

        // react, в отличие от стандарта, делает focus- и blur-события всплываемыми, чем мы и пользуемся
        private handleFocus(e) {
            this.prevFocusedElem = e.target;
            var domNode = React.findDOMNode(this);
            domNode.classList.remove('nn_inactive');
        }

        private handleBlur() {
            var domNode = React.findDOMNode(this);
            domNode.classList.add('nn_inactive');
        }


        private prevContentElemSize: Size;

        protected componentDidMount() {
            this.prevContentElemSize = Size.ofElem(this.getElemByRef('content'));
        }

        protected componentDidUpdate() {
            var contentElem = this.getElemByRef('content');
            var contentSize = Size.ofElem(contentElem);
            if (! contentSize.eq(this.prevContentElemSize)) {
                var wrapperElem = this.getElemByRef('wrapper');
                this.adjustWidth(wrapperElem, contentElem);
            }
        }

        private getElemByRef(ref: string): HTMLElement {
            return React.findDOMNode(this.refs[ref]);
        }

        private adjustWidth(wrapperElem: HTMLElement, contentElem: HTMLElement): void {
            var contentSize = Size.ofElem(contentElem);
            // ширина любого float не может превышать maxNodeViewBoxWidth;
            // если есть перенесенные на новую строку float-элементы,
            // после расширения wrapper на maxNodeViewBoxWidth, по карайней мере один float точно
            // вернется на исходную строку, что приведет к изменению высоты контейнера;
            // предполагаем, что обратное тоже верно:
            // т.е. изменение высоты после расширения свидетельствует, что был перенесенный float-элемент,
            // а adjustWidth должен работать до тех пор, пока переносы не исчезнут
            wrapperElem.style.width = (contentSize.width + this.props.maxNodeViewBoxWidth) + 'px';
            setTimeout(() => {
                var adjustedContentSize = Size.ofElem(contentElem);
                if (adjustedContentSize.height != contentSize.height) {
                    this.adjustWidth(wrapperElem, contentElem);
                } else {
                    wrapperElem.style.width = adjustedContentSize.width + 'px';
                    this.prevContentElemSize = adjustedContentSize;
                }
            }, 0);
        }

    }

    export function Element<D>(props: Props<D>): React.ReactElement {
        return React.createElement(Component, props);
    }


    class Size {

        constructor(
            public width: number,
            public height: number
        ) {}

        eq(size: Size): boolean {
            return this.width == size.width && this.height == size.height;
        }

        static ofElem(elem: HTMLElement): Size {
            var rect = elem.getBoundingClientRect();
            return new Size(rect.width, rect.height);
        }
    }


    function stringifyMods(blockName: string, mods: {}): string {
        if (!mods) {
            return '';
        }
        var modNames = [];
        for (var mod in mods) { mods.hasOwnProperty(mod) && modNames.push(mod); }
        return modNames.reduce((res, modName) => {
            var value = mods[modName];
            return res + (
                value !== undefined && value !== false ?
                    ' ' + blockName + '_' + modName + (value !== true ? '-' + value : '') :
                    ''
            );
        }, '');

    }

}


export = NNDocumentView;
