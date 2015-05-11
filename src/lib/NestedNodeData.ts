interface NestedNodeData {

    id: string;
    selected: boolean;

    forEach(cb: (node: NestedNodeData) => void, thisArg?): void;
}


export = NestedNodeData;
