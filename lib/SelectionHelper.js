define(["require", "exports", './Direction'], function (require, exports, Direction) {
    function resetSelectionToNode(node) {
        node.root.unselectDeep();
        node.select();
        return node;
    }
    exports.resetSelectionToNode = resetSelectionToNode;
    //todo или задокументировать тут все, или сделать api у NestedNode более приспособленным,
    // или ввести отдельную абстракцию, а то как-то слишком много кода из ничего
    function toggleSelectionWithNode(node) {
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
        if (!(preceding && preceding.selected)) {
            return node;
        }
        return getSelectionRegionBoundary(node, Direction.getForward());
    }
    exports.toggleSelectionWithNode = toggleSelectionWithNode;
    function shiftSelectionToNode(focusedNode, targetNode) {
        var directionToStart = Direction.getBackward();
        var preceding = focusedNode.getSibling(directionToStart);
        if (!(preceding && preceding.selected)) {
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
    exports.shiftSelectionToNode = shiftSelectionToNode;
    function getSelectionRegionBoundary(startNode, direction) {
        var result;
        var next = startNode;
        while (next && next.selected) {
            result = next;
            next = next.getSibling(direction);
        }
        return result;
    }
});
