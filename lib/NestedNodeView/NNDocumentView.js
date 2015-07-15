var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", 'bower_components/nn-react/React', '../NestedNodeProps/SelectionMode', './NestedNodeView', './KeyboardUtil'], function (require, exports, React, SelectionMode, NestedNodeView, KeyboardUtil) {
    var dom = React.DOM;
    var KeyCode = KeyboardUtil.KeyCode;
    var KeyMod = KeyboardUtil.KeyMod;
    var NNDocumentView;
    (function (NNDocumentView) {
        var Component = (function (_super) {
            __extends(Component, _super);
            function Component(props, context) {
                _super.call(this, props, context);
                this.handleKeyDown = this.handleKeyDown.bind(this);
                this.handleFocus = this.handleFocus.bind(this);
                this.handleBlur = this.handleBlur.bind(this);
                this.handleClick = this.handleClick.bind(this);
            }
            Component.prototype.getChildContext = function () {
                return new NestedNodeView.Context(this.props.documentActions, this.props.documentProps);
            };
            Component.prototype.render = function () {
                var node = this.props.documentProps.content;
                return (dom['div']({
                    className: 'nn' + stringifyMods('nn', this.props.styleMods),
                    tabIndex: 0,
                    onKeyDown: this.handleKeyDown,
                    onFocus: this.handleFocus,
                    onBlur: this.handleBlur,
                    onClick: this.handleClick
                }, dom['div']({ className: 'nn__doc-contentbox' }, dom['div']({ ref: 'content', className: 'nn__doc-content' }, React.createElement(this.props.nestedNodeViewComponent, {
                    node: node,
                    focused: node.focused,
                    editing: this.props.documentProps.editMode && node.focused
                })))));
            };
            Component.prototype.handleKeyDown = function (e) {
                var actions = this.props.documentActions;
                var editMode = this.props.documentProps.editMode;
                var shortcut = new KeyboardUtil.Shortcut(e);
                var eventHandled = (function () {
                    switch (true) {
                        case editMode && shortcut.eq(KeyCode.ESCAPE):
                            var undoChanges;
                            actions.exitEditMode(undoChanges = true);
                            return true;
                        case editMode && shortcut.eq(KeyCode.RETURN):
                            actions.exitEditMode();
                            return true;
                        case editMode:
                            return false;
                        case shortcut.eq(KeyCode.F2):
                        case shortcut.eq(KeyCode.SPACE):
                            actions.enterEditMode();
                            return true;
                        case shortcut.eq(KeyCode.LEFT):
                            actions.focusParentNode();
                            return true;
                        case shortcut.eq(KeyCode.RIGHT):
                            actions.focusNestedNode();
                            return true;
                        case shortcut.eq(KeyCode.UP):
                            actions.focusPrevNode(0 /* Reset */);
                            return true;
                        case shortcut.eq(KeyCode.UP, KeyMod.SHIFT):
                            actions.focusPrevNode(2 /* Shift */);
                            return true;
                        case shortcut.eq(KeyCode.DOWN):
                            actions.focusNextNode(0 /* Reset */);
                            return true;
                        case shortcut.eq(KeyCode.DOWN, KeyMod.SHIFT):
                            actions.focusNextNode(2 /* Shift */);
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
                    }
                })();
                if (eventHandled) {
                    e.preventDefault();
                }
            };
            Component.prototype.handleClick = function (e) {
                // click по редактируемой части узла досюда не всплывет,
                // сюда событие доходит, только если щелчек был на пустом месте,
                // а в таком случае фокус не должен сбиваться,
                // но т.к. пердотвратить сброс фокуса нельзя (preventDefault не поможет),
                // приходтся заново фокусировать заранее сохраненный prevFocusedElem
                // (побочным эффектом будет автоматическая прокрутка к этому узлу, увы)
                if (this.prevFocusedElem) {
                    this.prevFocusedElem.focus();
                }
            };
            // react, в отличие от стандарта, делает focus- и blur-события всплываемыми, чем мы и пользуемся
            Component.prototype.handleFocus = function (e) {
                this.prevFocusedElem = e.target;
                var domNode = React.findDOMNode(this);
                domNode.classList.remove('nn_inactive');
            };
            Component.prototype.handleBlur = function () {
                var domNode = React.findDOMNode(this);
                domNode.classList.add('nn_inactive');
            };
            Component.prototype.componentDidMount = function () {
                setTimeout(this.adjustWidthAndScroll.bind(this), 100);
            };
            Component.prototype.componentDidUpdate = function () {
                this.adjustWidthAndScroll();
            };
            Component.prototype.adjustWidthAndScroll = function () {
                var contentElem = React.findDOMNode(this.refs['content']);
                var wrapperElem = contentElem.parentElement.parentElement;
                var contentElemWidth = Math.ceil(contentElem.getBoundingClientRect().width);
                wrapperElem.style.width = contentElemWidth + 'px';
                wrapperElem.scrollLeft = 0; // хотя блок не прокручиваемый, scroll может сбиваться при фокусе
            };
            Component.prototype.getElemByRef = function (ref) {
                return React.findDOMNode(this.refs[ref]);
            };
            // без этой декларации getChildContext() бросит исключение
            Component.childContextTypes = new NestedNodeView.Context();
            Component.defaultProps = {
                nodeViewBoxMaxWidth: 400
            };
            return Component;
        })(React.Component);
        NNDocumentView.Component = Component;
        function Element(props) {
            return React.createElement(Component, props);
        }
        NNDocumentView.Element = Element;
        function stringifyMods(blockName, mods) {
            if (!mods) {
                return '';
            }
            var modNames = [];
            for (var mod in mods) {
                mods.hasOwnProperty(mod) && modNames.push(mod);
            }
            return modNames.reduce(function (res, modName) {
                var value = mods[modName];
                return res + (value !== undefined && value !== false ? ' ' + blockName + '_' + modName + (value !== true ? '-' + value : '') : '');
            }, '');
        }
    })(NNDocumentView || (NNDocumentView = {}));
    return NNDocumentView;
});
