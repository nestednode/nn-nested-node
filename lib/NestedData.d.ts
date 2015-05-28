interface NestedData<D> {
    owner?: {
        id: string;
        selected: boolean;
    };
    nested?: NestedData.Nested<D>;
}
declare module NestedData {
    interface Nested<D> {
        map<T>(cb: (data: D, key) => T, thisArg?: any): T[];
        forEach(cb: (data: D, key) => void, thisArg?: any): void;
    }
}
export = NestedData;
