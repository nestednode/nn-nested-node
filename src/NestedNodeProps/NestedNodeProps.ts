interface NestedNodeProps<D> {

    id?: string;
    selected?: boolean;
    focused?: boolean;

    data: D;

    nested?: NestedNodeProps<D>[];
}


export = NestedNodeProps;
