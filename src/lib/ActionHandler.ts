import NodeRelation = require('./NodeRelation');


interface ActionHandler {

    handleFocusNodeById(id: string, extendSelection?: boolean): void;

    handleFocusMoveTo(targetNodeRelation: NodeRelation, extendSelection?: boolean): void;

}


export = ActionHandler;
