export interface Todo {
    id: number;
    title: string;
    done: boolean;
}
export interface Model {
    todos: Todo[];
    hash: string;
    clicked?: number;
    click_time?: number;
    editing?: number;
    all_done?: boolean;
}
export declare function mount(model: Model, update: (action: string, model: Model, data?: any) => Model, view: (model: Model, signal: (action: string, data?: any) => void) => HTMLElement, id: string, subscriptions: (signal: (action: string, data?: any) => void) => void): void;
declare const initial_model: Model;
/**
 * `update` transforms the `model` based on the `action`.
 * @param {String} action - the desired action to perform on the model.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {any} data - the data we want to "apply" to the item.
 * @return {Model} new_model - the transformed model.
 */
export declare function update(action: string, model: Model, data?: any): Model;
declare function view(model: Model): HTMLElement;
export declare function subscriptions(signal: (action: string, data?: any) => void): void;
export { initial_model, update, view, subscriptions };
