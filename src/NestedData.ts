interface NestedData<D> {

    //id?: string;

    owner?: { id: string; selected: boolean; }

    // если тип описать как inline, то ide считает "nested = <D[]>[]" ошибкой
    nested?: NestedData.Nested<D>

}


module NestedData {

    // поэтому вынесено отдельно
    export interface Nested<D> {

        map<T>(cb: (data: D, key) => T, thisArg?): T[];
        forEach(cb: (data: D, key) => void, thisArg?): void;

    }

}


export = NestedData;
