import NestedNode = require('./lib/NestedNode');


class NestedNodeDocument {

    root: NestedNode;

    focusedNode: NestedNode;
    previouslyFocusedNested: Map<NestedNode, NestedNode>;
    currentFocusLevel: number;


    focusNode(node: NestedNode, extendSelection = false): void {
        if (! node) {
            return;
        }
        if (extendSelection) {
            if (node.selected) {
                if (this.root.getSelection().length === 1) {
                    // нельзя снять выделение у единственного выбранного узла
                    // в finder, однако, в таком случае выбирается родительский
                    return;
                }
                node.unselect();
                this.resetFocusedNode();
                return;
            }
            var ensureNestedUnselected = true;
            node.select(ensureNestedUnselected);
            this.resetFocusedNode(node);
            return;
        }
        this.root.unselectDeep();
        node.select();
        this.resetFocusedNode(node);
    }

    focusNestedNode(): void {
        var nested = this.previouslyFocusedNested.get(this.focusedNode) || this.focusedNode.firstNested;
        this.focusNode(nested);
    }

    focusParentNode(): void {
        this.focusNode(this.focusedNode.parent);
    }

    focusPrecedingNode(extendSelection = false): void {
        var nodeBefore = this.focusedNode.getPreceding(this.currentFocusLevel);
        this.focusSiblingNode(nodeBefore, extendSelection);
    }

    focusFollowingNode(extendSelection = false): void {
        var nodeAfter = this.focusedNode.getFollowing(this.currentFocusLevel);
        this.focusSiblingNode(nodeAfter, extendSelection);
    }

    private focusSiblingNode(node: NestedNode, extendSelection): void {
        if (extendSelection && this.focusedNode.selected && node && node.selected) {
            this.focusedNode.unselect();
            this.resetFocusedNode(node);
            return;
        }
        this.focusNode(node, extendSelection);
    }

    private resetFocusedNode(node?: NestedNode) {
        if (!node) {
            var selection = this.root.getSelection();
            node = selection[selection.length - 1]
        }
        this.focusedNode = node;
        if (node.hasParent) {
            this.previouslyFocusedNested.set(node.parent, node);
        }
    }

}


export = NestedNodeDocument;
