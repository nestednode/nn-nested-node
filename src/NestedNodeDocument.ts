import Collection = require('pkg/Collection/Collection');
import NestedNode = require('./NestedNode');
import NestedNodeRegistry = require('./NestedNodeRegistry');
import DocumentActions = require('./DocumentActions');
import NodeRelation = require('./NodeRelation');
import Direction = require('./Direction');


class NestedNodeDocument<D> implements NestedNodeRegistry<D>, DocumentActions {

    root: NestedNode<D>;

    private id: string;
    private nodeRegistry: Collection.Map<string, NestedNode<D>>;
    private nodeRegistryCounter = 0;

    focusedNode: NestedNode<D>;
    previouslyFocusedNested: Collection.Map<NestedNode<D>, NestedNode<D>>;
    currentFocusLevel: number;

    constructor() {
        this.id = 'doc';
        this.nodeRegistry = new Collection.Map<string, NestedNode<D>>();
        this.previouslyFocusedNested = new Collection.Map<NestedNode<D>, NestedNode<D>>();
    }

    // * Node Registry

    registerNode(node: NestedNode<D>): string {
        //todo check if node not already registred
        var nodeId = this.id + '-' + ++this.nodeRegistryCounter;
        this.nodeRegistry.set(nodeId, node);
        return nodeId;
    }

    unregisterNode(node: NestedNode<D>): void {
        this.nodeRegistry.delete(node.id);
        //todo cleanup previouslyFocusedNested
    }

    getNodeById(id: string): NestedNode<D> {
        return this.nodeRegistry.get(id);
    }

    // * Document Actions

    // ** Actions With Focused Node

    focusNodeById(id: string, extendSelection = false): void {
        console.log('focusNodeById handled!', id);
        this.focusNode(this.getNodeById(id), extendSelection);
    }

    focusRelatedNode(targetNodeRelation: NodeRelation, extendSelection = false): void {
        switch (targetNodeRelation) {
            case NodeRelation.Parent:
                this.focusParentNode();
                break;
            case NodeRelation.Nested:
                this.focusNestedNode();
                break;
            case NodeRelation.PrecedingSibling:
                this.focusSiblingNode(Direction.getBackward(), extendSelection);
                break;
            case NodeRelation.FollowingSibling:
                this.focusSiblingNode(Direction.getForward(), extendSelection);
                break;
        }
    }

    protected focusNode(node: NestedNode<D>, extendSelection = false): void {
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

    protected focusNestedNode(): void {
        var nested = this.previouslyFocusedNested.get(this.focusedNode) || this.focusedNode.firstNested;
        var extendSelection;
        this.focusNode(nested, extendSelection = false); // перемещение фокуса к nested всегда только сужает выделение
    }

    protected focusParentNode(): void {
        var extendSelection;
        this.focusNode(this.focusedNode.parent, extendSelection = false); // перемещение к parent и так его расшриряет
    }

    protected focusSiblingNode(direction: Direction, extendSelection): void {
        var sameParentOnly;
        var node = this.focusedNode.getSibling(direction, sameParentOnly = false, this.currentFocusLevel);
        if (extendSelection && this.focusedNode.selected && node && node.selected) {
            this.focusedNode.unselect();
            this.makeNodeFocused(node);
            return;
        }
        this.focusNode(node, extendSelection);
    }

    private makeNodeFocused(node?: NestedNode<D>) {
        if (!node) {
            var selection = this.root.getSelection();
            node = selection[selection.length - 1]
        }
        this.focusedNode = node;
        if (node.hasParent) {
            this.previouslyFocusedNested.set(node.parent, node);
        }
    }

    // ** ...
}


export = NestedNodeDocument;
