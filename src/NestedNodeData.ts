interface NestedNodeData {

    id: string;
    text: string;
    selected: boolean;

    map<T>(cb: (node: NestedNodeData) => T, thisArg?): T[];
    forEach(cb: (node: NestedNodeData) => void, thisArg?): void;
}


export = NestedNodeData;
