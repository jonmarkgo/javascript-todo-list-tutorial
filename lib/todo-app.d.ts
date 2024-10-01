declare module 'todo-app' {
    interface Todo {
        id: number;
        title: string;
        done: boolean;
    }

    interface Model {
        todos: Todo[];
        hash: string;
    }

    interface Signal {
        (action: string, data?: any): void;
    }

    export function update(msg: string, model: Model): Model;
    export function render_item(todo: Todo, model: Model, signal: Signal): HTMLElement;
    export function render_main(model: Model, signal: Signal): HTMLElement;
    export function render_footer(model: Model): HTMLElement;
    export function view(model: Model): HTMLElement;
}
