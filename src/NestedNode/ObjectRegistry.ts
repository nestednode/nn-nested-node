interface ObjectRegistry<T> {

    registerItem(item: T, suggestedId?: string): string;

    unregisterItem(item: T): void;

    getItemById(id: string): T;
}


export = ObjectRegistry;
