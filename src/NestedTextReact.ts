import NestedText = require('./NestedText');
import DocumentActions = require('./DocumentActions');
import React = require('pkg/React/React');
import dom = React.DOM;


declare var require;
require(['pkg/require-css/css!../styles/NestedNodeStyle']);


// * Props and Context

export interface NestedTextProps {
    key?;
    nodeData: NestedText;
}

// объекты этого класса служат:
// - результатом для функции getChildContext (при передаче реального аргумента в конструктор),
// - значением для почему-то обязательных реактовских деклараций contextTypes и childContextTypes
// сам класс в роли интерфейса используется:
// - для указания типа поля context
// - в декларации DocumentProps
export class DocumentContext { constructor(
    public documentActions: DocumentActions = React.PropTypes.any
){} }


export interface DocumentProps extends NestedTextProps, DocumentContext {

}


// * Components

// оказывается, класс в генерируемом коде объявляется как
// var NestedTextComp = ...
// а не как
// function NestedTextComp ...
// поэтому в данном месте еще нельзя ссылаться на нижеописанные классы,
// хотя компилятор ни о чем таком не предупреждает:

//export var NestedTextElem = React.createFactory<NestedTextProps>(NestedTextComp);
//export var NestedTextDocumentElem = React.createFactory<DocumentProps>(NestedTextDocumentComp);


export var NestedTextElem: React.ReactElementFactory<NestedTextProps>;

class NestedTextComp extends React.Component<NestedTextProps, any> {

    // без этой декларации this.context будет пустым
    static contextTypes = new DocumentContext();

    context: DocumentContext;

    render() {
        var data = this.props.nodeData;
        return (
            dom['div']({ className: 'nn_node', key: data.owner.id },
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
                        data.nested.map((nestedData, key) => NestedTextElem({ nodeData: nestedData, key: key })) :
                        false
                )
            )
        )
    }

    handleClick() {
        var actions = this.context.documentActions;
        var owner = this.props.nodeData.owner;
        actions && owner && actions.focusNodeById(owner.id);
    }
}

NestedTextElem = React.createFactory<NestedTextProps>(NestedTextComp);



class NestedTextDocumentComp extends React.Component<DocumentProps, any> {

    // без этой декларации getChildContext() бросит исключение
    static childContextTypes = new DocumentContext();

    getChildContext() {
        return new DocumentContext(this.props.documentActions);
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

export var NestedTextDocumentElem = React.createFactory<DocumentProps>(NestedTextDocumentComp);
