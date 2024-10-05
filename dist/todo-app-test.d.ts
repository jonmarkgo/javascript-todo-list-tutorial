interface Todo {
    id: number;
    title: string;
    completed: boolean;
}
interface Model {
    todos: Todo[];
    hash: string;
}
declare function update(msg: string, model: Model, data?: any): Model;
declare function view(model: Model): HTMLElement;
declare function subscriptions(model: Model): void;
export { update, view, subscriptions };
