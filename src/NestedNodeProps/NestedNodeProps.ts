interface NestedNodeProps<D> {

    id?: string;
    selected?: boolean;
    focused?: boolean;

    data: D;

    nested?: NestedNodeProps.Nested<D>;
}


module NestedNodeProps {

    export interface Nested<D> {

        map<T>(cb: (node: NestedNodeProps<D>) => T, thisArg?): T[];
        forEach(cb: (node: NestedNodeProps<D>) => void, thisArg?): void;

    }

}

export = NestedNodeProps;
