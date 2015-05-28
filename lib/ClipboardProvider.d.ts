interface ClipboardProvider<T> {
    get(): T;
    set(data: T): void;
}
export = ClipboardProvider;
