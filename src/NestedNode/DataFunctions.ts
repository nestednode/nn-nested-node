interface DataFunctions<D> {

    getBlank(): D;

    isBlank(data: D): boolean;

    isEqual(data1: D, data2: D): boolean;

    duplicate(data: D): D;

}


export = DataFunctions;
