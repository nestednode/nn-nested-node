// clipboard принимает и возвращает именно данные нужного типа
// если, например, системный clipboard хранит данные только в строках,
// то сериализацию и десериализацию провайдер производит сам

interface ClipboardProvider<T> {

    get(): T;
    set(data: T): void;

}


export = ClipboardProvider;
