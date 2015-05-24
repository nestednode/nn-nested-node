import Collection = require('pkg/Collection/Collection');
import EventEmitter = require('pkg/EventEmitter/EventEmitter');
import NestedNode = require('./NestedNode');
import NestedNodeRegistry = require('./NestedNodeRegistry');
import DocumentActions = require('./DocumentActions');
import Direction = require('./Direction');
import SelectionMode = require('./SelectionMode');

import Command = require('./Command/Command');
import AppendCommand = require('./Command/AppendCommand');
import RemoveCommand = require('./Command/RemoveCommand');


class NestedNodeDocument<D> extends EventEmitter implements NestedNodeRegistry<D>, DocumentActions {

    protected root: NestedNode<D>;
    get content() {
        return this.root.data;
    }

    private id: string;
    private nodeRegistry: Collection.Map<string, NestedNode<D>>;
    private nodeRegistryCounter = 0;

    focusedNode: NestedNode<D>;
    previouslyFocusedNested: Collection.Map<NestedNode<D>, NestedNode<D>>;
    currentFocusLevel: number;

    constructor(data: D) {
        super();
        this.id = 'doc'; //todo something
        this.nodeRegistry = new Collection.Map<string, NestedNode<D>>();
        this.previouslyFocusedNested = new Collection.Map<NestedNode<D>, NestedNode<D>>();

        this.root = new NestedNode<D>(this, data, this.nodeDataDuplicator);
        this.focusNode(this.root);

        this.addListener('focusChange', () => this.emit('change'));
        this.addListener('contentChange', () => this.emit('change'));
    }


    // * Abstract Node Data methods

    protected getBlankNodeData(): D {
        throw new Error('abstract method');
    }

    // это должна быть чистая функция, ссылка на нее она передается без привязки к контексту
    protected nodeDataDuplicator(data: D): D {
        throw new Error('abstract method');
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

    focusNodeById(id: string, selectionMode: SelectionMode): void {
        var node = this.getNodeById(id);
        if (! node) {
            console.warn('No node found with id: ' + id);
            return;
        }
        var updateFocusLevel;
        this.focusNode(node, selectionMode, updateFocusLevel=true);
    }

    focusParentNode(): void {
        var updateFocusLevel;
        this.focusNode(this.focusedNode.parent, SelectionMode.Reset, updateFocusLevel=true);
    }

    focusNestedNode(): void {
        var nested = this.previouslyFocusedNested.get(this.focusedNode) || this.focusedNode.firstNested;
        var updateFocusLevel;
        this.focusNode(nested, SelectionMode.Reset, updateFocusLevel=true);
    }

    focusPrevNode(selectionMode: SelectionMode): void {
        this.focusSiblingNode(Direction.getBackward(), selectionMode);
    }

    focusNextNode(selectionMode: SelectionMode): void {
        this.focusSiblingNode(Direction.getForward(), selectionMode);
    }

    protected focusSiblingNode(direction: Direction, selectionMode: SelectionMode): void {

        if ([SelectionMode.Reset, SelectionMode.Shift].indexOf(selectionMode) == -1) {
            throw new Error('Unsupported SelectionMode for this operation :' + selectionMode);
        }
        var sibling;
        var sameParentOnly;
        var updateFocusLevel;

        if (selectionMode == SelectionMode.Shift) {
            sibling = this.focusedNode.getSibling(direction, sameParentOnly=true);
            this.focusNode(sibling, SelectionMode.Shift, updateFocusLevel=true);
        } else {
            sibling = this.focusedNode.getSibling(direction, sameParentOnly=false, this.currentFocusLevel);
            this.focusNode(sibling, SelectionMode.Reset, updateFocusLevel=false);
        }
    }

    protected focusNode(node: NestedNode<D>, selectionMode: SelectionMode = SelectionMode.Reset, updateFocusLevel = true): void {
        if (! node) {
            return;
        }
        var nodeToFocus = (() => { switch (selectionMode) {
            case SelectionMode.Reset: return this.resetSelectionToNode(node);
            case SelectionMode.Toggle: return this.toggleSelectionWithNode(node);
            case SelectionMode.Shift: return this.shiftSelectionToNode(node);
            default: throw new Error('Unknown SelectionMode: ' + selectionMode);
        }})();

        this.setFocusedNode(nodeToFocus, updateFocusLevel);
        this.emit('focusChange', this.focusedNode.id);
    }

    // todo вынести эти методы, аналогично командам
    // для них не предусмотрен undo, значит они могут быть просто статическими методами
    // типа SelectionActions.toggleSelectionWithNode(args) -> focused node
    // this.root можно заменить на node.root,
    // this.focused.node нужно передать только в shiftSelectionToNode
    // а getSelectionRegionBoundary будет private методом в этом пакете,
    // нечего ему вообще делать в NestedNode

    private resetSelectionToNode(node: NestedNode<D>): NestedNode<D> {
        this.root.unselectDeep();
        node.select();
        return node;
    }

    private toggleSelectionWithNode(node: NestedNode<D>): NestedNode<D> {
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

        var preceding = node.getSibling(Direction.getBackward());
        var following = node.getSibling(Direction.getForward());
        if (node.selected) {
            var selection = this.root.getSelection();
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
        return node.getSelectionRegionBoundary(Direction.getForward());
    }

    private shiftSelectionToNode(targetNode: NestedNode<D>): NestedNode<D> {

        var directionToStart = Direction.getBackward();
        var preceding = this.focusedNode.getSibling(directionToStart);
        if (! (preceding && preceding.selected)) {
            directionToStart = Direction.getForward();
        }
        var startNode = this.focusedNode.getSelectionRegionBoundary(directionToStart);
        var targetIsStart = targetNode === startNode;
        var directionToTarget = startNode.getDirectionToSibling(targetNode);

        if (!directionToTarget && !targetIsStart) {
            return this.focusedNode;
        }

        var nodeToUnselect = this.focusedNode;
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
        return targetNode.getSelectionRegionBoundary(directionToTarget);
    }

    private setFocusedNode(node: NestedNode<D>, updateFocusLevel: boolean): void {
        this.focusedNode = node;
        if (node.hasParent) {
            this.previouslyFocusedNested.set(node.parent, node);
        }
        if (updateFocusLevel) {
            this.currentFocusLevel = this.focusedNode.level;
        }
    }

    // ** Modification Actions

    insertNewNode(): void {
        var newNode = new NestedNode(this, this.getBlankNodeData(), this.nodeDataDuplicator);
        this.executeCommand(new AppendCommand([newNode], this.focusedNode));
    }

    removeNode(): void {
        this.executeCommand(new RemoveCommand(this.root.getSelection()));
    }

    private executeCommand(cmd: Command) {
        this.root.unselectDeep();
        this.setFocusedNode(cmd.execute(), true);
        this.emit('contentChange', this.content);
    }

}


export = NestedNodeDocument;
