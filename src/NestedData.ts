interface NestedData<D> {

    id?: string;

    owner?: { id: string; selected: boolean; }

    nested?: {
        map<T>(cb: (data: D) => T, thisArg?): T[];
        forEach(cb: (data: D) => void, thisArg?): void;
    }
}


export = NestedData;
