import NestedNode = require('./NestedNode');
//import N = NestedNode.AnyNestedNode;
// ide тупит, если использовать AnyNestedNode вместо NestedNode<any> (а в командах почему-то все ок)
import Direction = require('./Direction');


export function resetSelectionToNode(node: NestedNode<any>): NestedNode<any> {
    node.root.unselectDeep();
    node.select();
    return node;
}

//todo или задокументировать тут все, или сделать api у NestedNode более приспособленным,
// или ввести отдельную абстракцию, а то как-то слишком много кода из ничего

export function toggleSelectionWithNode(node: NestedNode<any>): NestedNode<any> {
    var parentSelected = false;
    var parent = node.parent;
    while (parent && !parentSelected) {
        if (parent.selected) {
            parentSelected = true;
        }
        parent = parent.parent;
    }
    if (parentSelected) {
        return node;
    }

    //fixme учитывать, что node может быть корневым, тогда getSibling бросит исключение вернет
    var preceding = node.getSibling(Direction.getBackward());
    var following = node.getSibling(Direction.getForward());
    if (node.selected) {
        var selection = node.root.getSelection();
        if (selection.length === 1) {
            // нельзя снять выделение у единственного выбранного узла
            // в finder, однако, в таком случае выбирается родительский,
            //
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
    return getSelectionRegionBoundary(node, Direction.getForward());
}


export function shiftSelectionToNode(focusedNode: NestedNode<any>, targetNode: NestedNode<any>): NestedNode<any> {

    var directionToStart = Direction.getBackward();
    var preceding = focusedNode.getSibling(directionToStart);
    if (! (preceding && preceding.selected)) {
        directionToStart = Direction.getForward();
    }
    var startNode = getSelectionRegionBoundary(focusedNode, directionToStart);
    var targetIsStart = targetNode === startNode;
    var directionToTarget = startNode.getDirectionToSibling(targetNode);

    if (!directionToTarget && !targetIsStart) {
        return focusedNode;
    }

    var nodeToUnselect = focusedNode;
    while (nodeToUnselect !== startNode) {
        nodeToUnselect.unselect();
        nodeToUnselect = nodeToUnselect.getSibling(directionToStart);
    }

    if (targetIsStart) {
        return startNode;
    }

    var nodeToSelect = startNode;
    while ((nodeToSelect = nodeToSelect.getSibling(directionToTarget)) !== targetNode) {
        nodeToSelect.unselectDeep().select();
    }
    targetNode.unselectDeep().select();

    // если следующий за targetNode тоже выбранный, значит регион слился с другим, и нужно вернуть границу общего региона
    return getSelectionRegionBoundary(targetNode, directionToTarget);
}


function getSelectionRegionBoundary(startNode: NestedNode<any>, direction: Direction): NestedNode<any> {
    var result;
    var next = startNode;
    while (next && next.selected) {
        result = next;
        next = next.getSibling(direction);
    }
    return result;
}
