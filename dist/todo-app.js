import { text, strong, footer, span, ul, li, a, button, div, empty, input, h1, header, label, section } from './elmish';
export function mount(model, update, view, id, subscriptions) {
    console.log('Mount function called with id:', id);
    const app = document.getElementById(id);
    if (!app) {
        console.error(`Element with id ${id} not found`);
        return;
    }
    console.log('App element found:', app);
    function render() {
        console.log('Render function called');
        if (app) {
            console.log('Emptying app element');
            empty(app);
            console.log('Generating view element');
            const viewElement = view(model, signal);
            console.log('View element generated:', viewElement);
            app.appendChild(viewElement);
            console.log('View element appended to app');
        }
    }
    function signal(action, data) {
        console.log('Signal function called with action:', action, 'and data:', data);
        const newModel = update(action, model, data);
        if (JSON.stringify(newModel) !== JSON.stringify(model)) {
            model = newModel;
            render();
        }
    }
    render();
    subscriptions(signal);
}
const initial_model = {
    todos: [],
    hash: '#/',
    all_done: false,
    editing: undefined,
    clicked: undefined,
    click_time: undefined
};
/**
 * `update` transforms the `model` based on the `action`.
 * @param {String} action - the desired action to perform on the model.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {any} data - the data we want to "apply" to the item.
 * @return {Model} new_model - the transformed model.
 */
export function update(action, model, data) {
    const new_model = JSON.parse(JSON.stringify(model));
    switch (action) {
        case 'ADD':
            if (data && data.trim().length > 0) {
                new_model.todos.push({
                    id: new_model.todos.length > 0 ? new_model.todos[new_model.todos.length - 1].id + 1 : 1,
                    title: data.trim(),
                    done: false
                });
            }
            break;
        case 'TOGGLE':
            new_model.todos = new_model.todos.map(todo => todo.id === data ? { ...todo, done: !todo.done } : todo);
            break;
        case 'TOGGLE_ALL':
            const allDone = new_model.todos.every(todo => todo.done);
            new_model.todos = new_model.todos.map(todo => ({ ...todo, done: !allDone }));
            break;
        case 'DELETE':
            new_model.todos = new_model.todos.filter(todo => todo.id !== data);
            break;
        case 'EDIT':
            new_model.editing = data;
            break;
        case 'SAVE':
            new_model.todos = new_model.todos.map(todo => todo.id === new_model.editing ? { ...todo, title: data.trim() } : todo);
            new_model.editing = undefined;
            break;
        case 'CANCEL':
            new_model.editing = undefined;
            break;
        case 'CLEAR_COMPLETED':
            new_model.todos = new_model.todos.filter(todo => !todo.done);
            break;
        case 'ROUTE':
            new_model.hash = data;
            break;
    }
    return new_model;
}
/**
 * `render_item` creates an DOM "tree" with a single Todo List Item
 * using the "elmish" DOM functions (`li`, `div`, `input`, `label` and `button`)
 * returns an `<li>` HTML element with a nested `<div>` which in turn has the:
 * + `<input type=checkbox>` which lets users to "Toggle" the status of the item
 * + `<label>` which displays the Todo item text (`title`) in a `<text>` node
 * + `<button class="destroy">` lets people "delete" a todo item.
 * see: https://github.com/dwyl/learn-elm-architecture-in-javascript/issues/52
 * @param  {Todo} item the todo item object
 * @param {Model} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {Object} <li> DOM Tree which is nested in the <ul>.
 * @example
 * // returns <li> DOM element with <div>, <input>. <label> & <button> nested
 * var DOM = render_item({id: 1, title: "Build Todo List App", done: false});
 */
function render_item(item, model, signal) {
    return li([
        "data-id=" + item.id,
        "id=" + item.id,
        item.done ? "class=completed" : "",
        model.editing === item.id ? "class=editing" : ""
    ], [
        div(["class=view"], [
            input([
                item.done ? "checked=true" : "",
                "class=toggle",
                "type=checkbox",
                () => signal('TOGGLE', item.id)
            ], []),
            label([() => signal('EDIT', item.id)], [text(item.title)]),
            button(["class=destroy",
                () => signal('DELETE', item.id)], [])
        ]),
        ...(model.editing === item.id ? [
            input(["class=edit", "id=" + item.id, "value=" + item.title, "autofocus"], [])
        ] : [])
    ]);
}
/**
 * `render_main` renders the `<section class="main">` of the Todo List App
 * which contains all the "main" controls and the `<ul>` with the todo items.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {Object} <section> DOM Tree which containing the todo list <ul>, etc.
 */
function render_main(model, signal) {
    const display = model.hash === '#/' ? 'block' : 'none';
    return section(["class=main", "style=display:" + display], [
        input([
            "id=toggle-all",
            "class=toggle-all",
            "type=checkbox",
            model.all_done ? "checked=true" : "",
            (function (ev) {
                signal('TOGGLE_ALL', !model.all_done);
            })
        ], []),
        label(["for=toggle-all"], [
            text("Mark all as complete")
        ]),
        ul(["class=todo-list"], model.todos
            .filter(function (item) {
            switch (model.hash) {
                case '#/active': return !item.done;
                case '#/completed': return item.done;
                default: return true;
            }
        })
            .map(function (item) {
            return render_item(item, model, signal);
        }))
    ]);
}
function render_header(model) {
    return (header(["class=header"], [
        h1([], [text("todos")]),
        input([
            "class=new-todo",
            "placeholder=What needs to be done?",
            "autofocus",
            () => ({ type: 'ADD' })
        ], [])
    ]));
}
function render_footer(model) {
    const { todos, hash } = model;
    const count = todos.filter(todo => !todo.done).length;
    const done = todos.length - count;
    const display = (count > 0 || done > 0) ? "block" : "none";
    const display_clear = (done > 0) ? "block" : "none";
    return (footer(["class=footer", "id=footer", "style=display:" + display], [
        span(["class=todo-count", "id=count"], [
            strong(count.toString()),
            text(count === 1 ? " item left" : " items left")
        ]),
        ul(["class=filters"], [
            li([], [
                a([
                    "href=#/", "id=all", "class=" +
                        (hash === '#/' ? "selected" : '')
                ], [text("All")])
            ]),
            li([], [
                a([
                    "href=#/active", "id=active", "class=" +
                        (hash === '#/active' ? "selected" : '')
                ], [text("Active")])
            ]),
            li([], [
                a([
                    "href=#/completed", "id=completed", "class=" +
                        (hash === '#/completed' ? "selected" : '')
                ], [text("Completed")])
            ])
        ]),
        button([
            "class=clear-completed",
            "style=display:" + display_clear,
            () => ({ type: 'CLEAR_COMPLETED' })
        ], [text("Clear completed")])
    ]));
}
function view(model) {
    return (section(["class=todoapp"], [
        render_header(model),
        render_main(model),
        render_footer(model)
    ]));
}
export function subscriptions(signal) {
    window.onhashchange = function () {
        signal('ROUTE', window.location.hash);
    };
}
export { initial_model, view };
//# sourceMappingURL=todo-app.js.map