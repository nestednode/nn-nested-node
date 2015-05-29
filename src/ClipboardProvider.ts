interface ClipboardProvider<T> {

    get(): T;
    set(content: T): void;

}


export = ClipboardProvider;
