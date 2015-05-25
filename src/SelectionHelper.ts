import NestedNode = require('./NestedNode');
//import N = NestedNode.AnyNestedNode;
// ide тупит, если использовать AnyNestedNode вместо NestedNode<any> (а в командах почему-то все ок)
import Direction = require('./Direction');


export function resetSelectionToNode(node: NestedNode<any>): NestedNode<any> {
    node.root.unselectDeep();
    node.select();
    return node;
}


export function toggleSelectionWithNode(node: NestedNode<any>): NestedNode<any> {

    if (isAncestorSelected(node)) {
        return node;
    }
    var preceding;
    var following;
    if (node.hasParent) {
        preceding = node.getSibling(Direction.getBackward());
        following = node.getSibling(Direction.getForward());
    }
    if (node.selected) {
        var selection = node.root.getSelection();
        if (selection.length === 1) {
            // нельзя снять выделение у единственного выбранного узла
            return node;
        }
        node.unselect();
        if (preceding && preceding.selected) {
            return preceding;
        }
        if (following && following.selected) {
            return following;
        }
        return selection[selection.indexOf(node) - 1] || selection[1];
    }
    node.unselectDeep().select();
    if (! (preceding && preceding.selected)) {
        return node;
    }
    return getSelectionBoundary(node, Direction.getForward());
}


export function shiftSelectionToNode(focusedNode: NestedNode<any>, targetNode: NestedNode<any>): NestedNode<any> {

    if (!focusedNode.hasParent || focusedNode.parent !== targetNode.parent) {
        return focusedNode;
    }

    var directionToStart = getDirectionToOppositeSelectionBoundary(focusedNode);
    var startNode = getSelectionBoundary(focusedNode, directionToStart);

    var nodeToUnselect = focusedNode;
    while (nodeToUnselect !== startNode) {
        nodeToUnselect.unselect();
        nodeToUnselect = nodeToUnselect.getSibling(directionToStart);
    }

    if (targetNode === startNode) {
        return startNode;
    }
    var directionToTarget = startNode.getDirectionToSibling(targetNode);
    var nodeToSelect = startNode;
    do {
        nodeToSelect = nodeToSelect.getSibling(directionToTarget);
        nodeToSelect.unselectDeep().select();
    } while (nodeToSelect !== targetNode);

    // не исключено, что следующий за targetNode тоже выбранный,
    // т.е. регион сливается с другим, и нужно вернуть границу общего региона
    return getSelectionBoundary(targetNode, directionToTarget);
}


function isAncestorSelected(node) {
    while (node.hasParent) {
        node = node.parent;
        if (node.selected) {
            return true;
        }
    }
    return false;
}

function getDirectionToOppositeSelectionBoundary(boundaryNode: NestedNode<any>): Direction {
    var following = boundaryNode.getSibling();
    return following && following.selected ? Direction.getForward() : Direction.getBackward();
}

function getSelectionBoundary(node: NestedNode<any>, direction: Direction): NestedNode<any> {
    var result;
    while (node && node.selected) {
        result = node;
        node = node.getSibling(direction);
    }
    return result;
}
