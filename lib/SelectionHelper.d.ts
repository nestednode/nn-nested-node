import NestedNode = require('./NestedNode');
export declare function resetSelectionToNode(node: NestedNode<any>): NestedNode<any>;
export declare function toggleSelectionWithNode(node: NestedNode<any>): NestedNode<any>;
export declare function shiftSelectionToNode(focusedNode: NestedNode<any>, targetNode: NestedNode<any>): NestedNode<any>;
export declare function getSelectionNearNode(node: any): any[];
