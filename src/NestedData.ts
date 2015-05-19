interface NestedData<D> {

    //id?: string;

    owner?: { id: string; selected: boolean; }

    nested?: {
        map<T>(cb: (data: D, key) => T, thisArg?): T[];
        forEach(cb: (data: D, key) => void, thisArg?): void;
    }
}


export = NestedData;
