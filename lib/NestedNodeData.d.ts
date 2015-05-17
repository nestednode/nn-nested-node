interface NestedNodeData {
    id: string;
    text: string;
    selected: boolean;
    map<T>(cb: (node: NestedNodeData) => T, thisArg?: any): T[];
    forEach(cb: (node: NestedNodeData) => void, thisArg?: any): void;
}
export = NestedNodeData;
