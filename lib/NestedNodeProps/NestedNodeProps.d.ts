interface NestedNodeProps<D> {
    id?: string;
    selected?: boolean;
    focused?: boolean;
    data: D;
    nested?: NestedNodeProps.Nested<D>;
}
declare module NestedNodeProps {
    interface Nested<D> {
        map<T>(cb: (node: NestedNodeProps<D>) => T, thisArg?: any): T[];
        forEach(cb: (node: NestedNodeProps<D>) => void, thisArg?: any): void;
    }
}
export = NestedNodeProps;
