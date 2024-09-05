import * as elmish from './elmish';

export interface Todo {
    id: number;
    title: string;
    done: boolean;
}

export interface Model {
    todos: Todo[];
    hash: string;
    all_done?: boolean;
    clicked?: number;
    click_time?: number;
    editing?: number;
}

export const initial_model: Model = {
    todos: [],
    hash: "#/"
};

/**
 * `update` transforms the `model` based on the `action`.
 * @param {string} action - the desired action to perform on the model.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {any} data - the data we want to "apply" to the item.
 * @return {Model} new_model - the transformed model.
 */
export function update(action: string, model: Model, data?: any): Model {
    const new_model: Model = JSON.parse(JSON.stringify(model)); // "clone" the model
    switch (action) {
        case 'ADD':
            const last = (model.todos.length > 0) ? model.todos[model.todos.length - 1] : null;
            const id = last ? last.id + 1 : 1;
            const input = document.getElementById('new-todo') as HTMLInputElement;
            new_model.todos.push({
                id: id,
                title: data || input.value.trim(),
                done: false
            });
            break;
        case 'TOGGLE':
            new_model.todos = new_model.todos.map(item => item.id === data ? { ...item, done: !item.done } : item);
            new_model.all_done = new_model.todos.every(item => item.done);
            break;
        case 'TOGGLE_ALL':
            new_model.all_done = !new_model.all_done;
            new_model.todos = new_model.todos.map(item => ({ ...item, done: new_model.all_done || false }));
            break;
        case 'DELETE':
            new_model.todos = new_model.todos.filter(item => item.id !== data);
            break;
        case 'EDIT':
            if (new_model.clicked === data && Date.now() - (new_model.click_time || 0) < 300) {
                new_model.editing = data;
            }
            else {
                new_model.clicked = data;
                new_model.click_time = Date.now();
                new_model.editing = undefined;
            }
            break;
        case 'SAVE':
            const edit = document.getElementsByClassName('edit')[0] as HTMLInputElement;
            const value = edit.value;
            const editId = parseInt(edit.id, 10);
            new_model.clicked = undefined;
            new_model.editing = undefined;
            if (!value || value.length === 0) {
                return update('DELETE', new_model, editId);
            }
            new_model.todos = new_model.todos.map(item => item.id === editId ? { ...item, title: value.trim() } : item);
            break;
        case 'CANCEL':
            new_model.clicked = undefined;
            new_model.editing = undefined;
            break;
        case 'CLEAR_COMPLETED':
            new_model.todos = new_model.todos.filter(item => !item.done);
            break;
        case 'ROUTE':
            new_model.hash = window.location.hash;
            break;
        default:
            return model;
    }
    return new_model;
}

/**
 * `render_item` creates a DOM "tree" with a single Todo List Item
 * using the "elmish" DOM functions (`li`, `div`, `input`, `label` and `button`)
 * returns an `<li>` HTML element with a nested `<div>` which in turn has the:
 * + `<input type=checkbox>` which lets users "Toggle" the status of the item
 * + `<label>` which displays the Todo item text (`title`) in a `<text>` node
 * + `<button class="destroy">` lets people "delete" a todo item.
 * see: https://github.com/dwyl/learn-elm-architecture-in-javascript/issues/52
 * @param  {Todo} item the todo item object
 * @param {Model} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <li> DOM Tree which is nested in the <ul>.
 * @example
 * // returns <li> DOM element with <div>, <input>. <label> & <button> nested
 * var DOM = render_item({id: 1, title: "Build Todo List App", done: false}, model, signal);
 */
export function render_item(item: Todo, model: Model, signal: (action: string, data?: any) => () => void): HTMLElement {
    const liAttributes = [`data-id=${item.id}`, `id=${item.id}`];
    if (item.done) {
        liAttributes.push("class=completed");
    }
    if (model.editing === item.id) {
        liAttributes.push("class=editing");
    }

    const inputAttributes = ["class=toggle", "type=checkbox"];
    if (item.done) {
        inputAttributes.push("checked=true");
    }

    return elmish.li(liAttributes, [
        elmish.div(["class=view"], [
            elmish.input([
                ...inputAttributes,
                `onclick=function(event){${signal('TOGGLE', item.id).toString()}()}`
            ], []),
            elmish.label([`ondblclick=function(event){${signal('EDIT', item.id).toString()}()}`], [elmish.text(item.title)]),
            elmish.button(["class=destroy", `onclick=function(event){${signal('DELETE', item.id).toString()}()}`], [])
        ]),
        ...(model.editing === item.id ? [
            elmish.input(["class=edit", `id=${item.id}`, `value=${item.title}`, "autofocus"], [])
        ] : [])
    ]);
}

/**
 * `render_main` renders the `<section class="main">` of the Todo List App
 * which contains all the "main" controls and the `<ul>` with the todo items.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <section> DOM Tree which containing the todo list <ul>, etc.
 */
export function render_main(model: Model, signal: (action: string, data?: any) => () => void): HTMLElement {
    const display = `style=display:${model.todos.length > 0 ? "block" : "none"}`;
    return elmish.section(["class=main", "id=main", display], [
        elmish.input([
            "id=toggle-all",
            "type=checkbox",
            `onclick=function(event){${signal('TOGGLE_ALL').toString()}()}`,
            model.all_done ? "checked=checked" : "",
            "class=toggle-all"
        ], []),
        elmish.label(["for=toggle-all"], [elmish.text("Mark all as complete")]),
        elmish.ul(["class=todo-list"], model.todos.length > 0
            ? model.todos
                .filter(item => {
                switch (model.hash) {
                    case '#/active':
                        return !item.done;
                    case '#/completed':
                        return item.done;
                    default:
                        return true;
                }
            })
                .map(item => render_item(item, model, signal))
            : [])
    ]);
}

/**
 * `render_footer` renders the `<footer class="footer">` of the Todo List App
 * which contains count of items to (still) to be done and a `<ul>` "menu"
 * with links to filter which todo items appear in the list view.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <section> DOM Tree which containing the <footer> element.
 * @example
 * // returns <footer> DOM element with other DOM elements nested:
 * var DOM = render_footer(model);
 */
export function render_footer(model: Model, signal: (action: string, data?: any) => () => void): HTMLElement {
    const activeCount = model.todos.filter(i => !i.done).length;
    const completedCount = model.todos.length - activeCount;
    const display = model.todos.length > 0 ? "block" : "none";
    const displayClear = completedCount > 0 ? "block" : "none";
    const itemText = ` item${activeCount !== 1 ? 's' : ''} left`;
    return elmish.footer(["class=footer", "id=footer", `style=display:${display}`], [
        elmish.span(["class=todo-count", "id=count"], [
            elmish.strong(activeCount.toString()),
            elmish.text(itemText)
        ]),
        elmish.ul(["class=filters"], [
            elmish.li([], [
                elmish.a([
                    "href=#/",
                    "id=all",
                    `class=${model.hash === '#/' ? "selected" : ''}`
                ], [elmish.text("All")])
            ]),
            elmish.li([], [
                elmish.a([
                    "href=#/active",
                    "id=active",
                    `class=${model.hash === '#/active' ? "selected" : ''}`
                ], [elmish.text("Active")])
            ]),
            elmish.li([], [
                elmish.a([
                    "href=#/completed",
                    "id=completed",
                    `class=${model.hash === '#/completed' ? "selected" : ''}`
                ], [elmish.text("Completed")])
            ])
        ]),
        elmish.button([
            "class=clear-completed",
            `style=display:${displayClear}`,
            `onclick=function(event){${signal('CLEAR_COMPLETED').toString()}()}`
        ], [
            elmish.text("Clear completed ["),
            elmish.span(["id=completed-count"], [elmish.text(completedCount.toString())]),
            elmish.text("]")
        ])
    ]);
}

/**
 * `view` renders the entire Todo List App
 * which contains count of items to (still) to be done and a `<ul>` "menu"
 * with links to filter which todo items appear in the list view.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <section> DOM Tree which containing all other DOM elements.
 * @example
 * // returns <section class="todo-app"> DOM element with other DOM els nested:
 * var DOM = view(model);
 */
export function view(model: Model, signal: (action: string, data?: any) => () => void): HTMLElement {
    return elmish.section(["class=todoapp"], [
        elmish.header(["class=header"], [
            elmish.h1([], [elmish.text("todos")]),
            elmish.input([
                "id=new-todo",
                "class=new-todo",
                "placeholder=What needs to be done?",
                "autofocus"
            ], [])
        ]),
        render_main(model, signal),
        render_footer(model, signal)
    ]);
}

/**
 * `subscriptions` let us "listen" for events such as "key press" or "click".
 * and respond according to a pre-defined update/action.
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * both the "update" and "render" functions when invoked with signal(action)
 */
export function subscriptions(signal: (action: string, data?: any) => () => void): void {
    const ENTER_KEY = 13;
    const ESCAPE_KEY = 27;
    document.addEventListener('keyup', function handler(e: KeyboardEvent) {
        switch (e.keyCode) {
            case ENTER_KEY:
                const editing = document.getElementsByClassName('editing');
                if (editing.length > 0) {
                    signal('SAVE')();
                }
                const new_todo = document.getElementById('new-todo') as HTMLInputElement;
                if (new_todo.value.length > 0) {
                    signal('ADD')();
                    new_todo.value = '';
                    new_todo.focus();
                }
                break;
            case ESCAPE_KEY:
                signal('CANCEL')();
                break;
        }
    });
    window.onhashchange = function route() {
        signal('ROUTE')();
    };
}
