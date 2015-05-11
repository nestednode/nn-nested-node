interface NestedNodeData {
    id: string;
    selected: boolean;
    forEach(cb: (node: NestedNodeData) => void, thisArg?: any): void;
}
export = NestedNodeData;
