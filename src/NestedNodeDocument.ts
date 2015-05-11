import Collection = require('pkg/Collection/Collection');
import NestedNode = require('./lib/NestedNode');
import NestedNodeRegistry = require('./lib/NestedNodeRegistry');
import Direction = require('./lib/Direction');


class NestedNodeDocument implements NestedNodeRegistry {

    root: NestedNode;

    private id: string;
    private nodeRegistry: Collection.Map<string, NestedNode>;
    private nodeRegistryCounter = 0;

    focusedNode: NestedNode;
    previouslyFocusedNested: Collection.Map<NestedNode, NestedNode>;
    currentFocusLevel: number;


    registerNode(node: NestedNode): string {
        //todo check if node not already registred
        var nodeId = this.id + '-' + ++this.nodeRegistryCounter;
        this.nodeRegistry.set(nodeId, node);
        return nodeId;
    }

    unregisterNode(node: NestedNode): void {
        this.nodeRegistry.delete(node.id);
        //todo cleanup previouslyFocusedNested
    }

    getNodeById(id: string): NestedNode {
        return this.nodeRegistry.get(id);
    }

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
                this.makeNodeFocused();
                return;
            }
            var ensureNestedUnselected;
            node.select(ensureNestedUnselected = true);
            this.makeNodeFocused(node);
            return;
        }
        this.root.unselectDeep();
        node.select();
        this.makeNodeFocused(node);
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
            this.makeNodeFocused(node);
            return;
        }
        this.focusNode(node, extendSelection);
    }

    private makeNodeFocused(node?: NestedNode) {
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
