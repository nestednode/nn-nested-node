import NodeRelation = require('./NodeRelation');


interface DocumentActions {

    focusNodeById(id: string, extendSelection?: boolean): void;

    focusRelatedNode(targetNodeRelation: NodeRelation, extendSelection?: boolean): void;

}


export = DocumentActions;
