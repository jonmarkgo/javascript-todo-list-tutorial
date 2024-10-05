interface Todo {
    id: number;
    title: string;
    completed: boolean;
}
interface Model {
    todos: Todo[];
    hash: string;
    all_done?: boolean;
    clicked?: number;
    click_time?: number;
    editing?: number | false;
}
declare function update(action: string, model: Model, data?: any): Model;
declare function view(model: Model): HTMLElement;
declare function subscriptions(model: Model): void;
export { update, view, subscriptions };
