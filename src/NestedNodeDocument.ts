import Collection = require('pkg/Collection/Collection');
import NestedNode = require('./lib/NestedNode');
import Direction = require('./lib/Direction');


class NestedNodeDocument {

    root: NestedNode;

    focusedNode: NestedNode;
    previouslyFocusedNested: Collection.Map<NestedNode, NestedNode>;
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
            var ensureNestedUnselected;
            node.select(ensureNestedUnselected = true);
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

    focusSiblingNode(direction: Direction, extendSelection = false): void {
        var sameParentOnly;
        var node = this.focusedNode.getSibling(direction, sameParentOnly = false, this.currentFocusLevel);
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
