/* if require fn is available, it means we are in Node.js Land i.e. testing! */
/* istanbul ignore next */
import { a, button, div, footer, input, h1, header, label, li, section, span, strong, text, ul } from './elmish';
const initial_model = {
    todos: [],
    hash: "#/"
};
/**
 * `update` transforms the `model` based on the `action`.
 * @param {String} action - the desired action to perform on the model.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {any} data - the data we want to "apply" to the item.
 * @return {Model} new_model - the transformed model.
 */
export function update(action, model, data) {
    const new_model = JSON.parse(JSON.stringify(model)); // "clone" the model
    switch (action) {
        case 'ADD':
            new_model.todos = new_model.todos || [];
            const last = new_model.todos.length > 0 ? new_model.todos[new_model.todos.length - 1] : null;
            const id = last ? last.id + 1 : 1;
            const input = document.getElementById('new-todo');
            new_model.todos.push({
                id: id,
                title: data || input.value.trim(),
                done: false
            });
            break;
        case 'TOGGLE':
            new_model.todos.forEach(function (item) {
                if (item.id === data) { // this should only "match" one item.
                    item.done = !item.done; // invert state of "done" e.g false >> true
                }
            });
            // if all todos are done=true then "check" the "toggle-all" checkbox:
            const all_done = new_model.todos.filter(function (item) {
                return item.done === false; // only care about items that are NOT done
            }).length;
            new_model.all_done = all_done === 0;
            break;
        case 'TOGGLE_ALL':
            new_model.all_done = !new_model.all_done;
            new_model.todos.forEach(function (item) {
                item.done = new_model.all_done ?? false;
            });
            break;
        case 'DELETE':
            // console.log('DELETE', data);
            new_model.todos = new_model.todos.filter(function (item) {
                return item.id !== data;
            });
            break;
        case 'EDIT':
            // this code is inspired by: https://stackoverflow.com/a/16033129/1148249
            // simplified as we are not altering the DOM!
            if (new_model.clicked && new_model.clicked === data &&
                Date.now() - 300 < new_model.click_time) { // DOUBLE-CLICK < 300ms
                new_model.editing = data;
            }
            else { // first click
                new_model.clicked = data; // so we can check if same item clicked twice!
                new_model.click_time = Date.now(); // timer to detect double-click 300ms
                new_model.editing = undefined; // reset
            }
            break;
        case 'SAVE':
            const edit = document.getElementsByClassName('edit')[0];
            const value = edit.value;
            const editId = parseInt(edit.id, 10);
            // End Editing
            new_model.clicked = undefined;
            new_model.editing = undefined;
            if (!value || value.length === 0) { // delete item if title is blank:
                return update('DELETE', new_model, editId);
            }
            // update the value of the item.title that has been edited:
            new_model.todos = new_model.todos.map(function (item) {
                if (item.id === editId && value && value.length > 0) {
                    item.title = value.trim();
                }
                return item; // return all todo items.
            });
            break;
        case 'CANCEL':
            new_model.clicked = undefined;
            new_model.editing = undefined;
            break;
        case 'CLEAR_COMPLETED':
            new_model.todos = new_model.todos.filter(function (item) {
                return !item.done; // only return items which are item.done = false
            });
            break;
        case 'ROUTE':
            new_model.hash = // (window && window.location && window.location.hash) ?
                window.location.hash; // : '#/';
            break;
        default: // if action unrecognised or undefined,
            return model; // return model unmodified
    } // see: https://softwareengineering.stackexchange.com/a/201786/211301
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
    return (li([
        "data-id=" + item.id,
        "id=" + item.id,
        item.done ? "class=completed" : "",
        model && model.editing && model.editing === item.id ? "class=editing" : ""
    ], [
        div(["class=view"], [
            input([
                item.done ? "checked=true" : "",
                "class=toggle",
                "type=checkbox",
                typeof signal === 'function' ? signal('TOGGLE', item.id) : ''
            ], []),
            label([typeof signal === 'function' ? signal('EDIT', item.id) : ''], [text(item.title)]),
            button(["class=destroy",
                typeof signal === 'function' ? signal('DELETE', item.id) : ''], [])
        ]),
    ].concat(model && model.editing && model.editing === item.id ? [
        input(["class=edit", "id=" + item.id, "value=" + item.title, "autofocus"], [])
    ] : [])));
}
/**
 * `render_main` renders the `<section class="main">` of the Todo List App
 * which contains all the "main" controls and the `<ul>` with the todo items.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {Object} <section> DOM Tree which containing the todo list <ul>, etc.
 */
function render_main(model, signal) {
    // Requirement #1 - No Todos, should hide #footer and #main
    const display = "style=display:"
        + (model.todos && model.todos.length > 0 ? "block" : "none");
    return (section(["class=main", "id=main", display], [
        input(["id=toggle-all", "type=checkbox",
            typeof signal === 'function' ? signal('TOGGLE_ALL') : '',
            (model.all_done ? "checked=checked" : ""),
            "class=toggle-all"
        ], []),
        label(["for=toggle-all"], [text("Mark all as complete")]),
        ul(["class=todo-list"], (model.todos && model.todos.length > 0) ?
            model.todos
                .filter(function (item) {
                switch (model.hash) {
                    case '#/active':
                        return !item.done;
                    case '#/completed':
                        return item.done;
                    default: // if hash doesn't match Active/Completed render ALL todos:
                        return true;
                }
            })
                .map(function (item) {
                return render_item(item, model, signal);
            }) : [])
    ]));
}
/**
 * `render_footer` renders the `<footer class="footer">` of the Todo List App
 * which contains count of items to (still) to be done and a `<ul>` "menu"
 * with links to filter which todo items appear in the list view.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {Object} <section> DOM Tree which containing the <footer> element.
 * @example
 * // returns <footer> DOM element with other DOM elements nested:
 * var DOM = render_footer(model);
 */
function render_footer(model, signal) {
    // count how many "active" (not yet done) items by filtering done === false:
    const done = (model.todos && model.todos.length > 0) ?
        model.todos.filter(function (i) { return i.done; }).length : 0;
    const count = (model.todos && model.todos.length > 0) ?
        model.todos.filter(function (i) { return !i.done; }).length : 0;
    // Requirement #1 - No Todos, should hide #footer and #main
    const display = (count > 0 || done > 0) ? "block" : "none";
    // number of completed items:
    const display_clear = (done > 0) ? "block;" : "none;";
    // pluralization of number of items:
    const left = (" item" + (count > 1 || count === 0 ? 's' : '') + " left");
    return (footer(["class=footer", "id=footer", "style=display:" + display], [
        span(["class=todo-count", "id=count"], [
            strong([], [text(count.toString())]),
            text(left)
        ]),
        ul(["class=filters"], [
            li([], [
                a([
                    "href=#/", "id=all", "class=" +
                        (model.hash === '#/' ? "selected" : '')
                ], [text("All")])
            ]),
            li([], [
                a([
                    "href=#/active", "id=active", "class=" +
                        (model.hash === '#/active' ? "selected" : '')
                ], [text("Active")])
            ]),
            li([], [
                a([
                    "href=#/completed", "id=completed", "class=" +
                        (model.hash === '#/completed' ? "selected" : '')
                ], [text("Completed")])
            ])
        ]), // </ul>
        button(["class=clear-completed", "style=display:" + display_clear,
            typeof signal === 'function' ? signal('CLEAR_COMPLETED') : ''
        ], [
            text("Clear completed ["),
            text(done.toString()),
            text("]")
        ])
    ]));
}
/**
 * `view` renders the entire Todo List App
 * which contains count of items to (still) to be done and a `<ul>` "menu"
 * with links to filter which todo items appear in the list view.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {Object} <section> DOM Tree which containing all other DOM elements.
 * @example
 * // returns <section class="todo-app"> DOM element with other DOM els nested:
 * var DOM = view(model);
 */
export function view(model, signal) {
    return (section(["class=todoapp"], [
        header(["class=header"], [
            h1([], [
                text("todos")
            ]), // </h1>
            input([
                "id=new-todo",
                "class=new-todo",
                "placeholder=What needs to be done?",
                "autofocus",
                "onkeypress=" + signal('ADD', null, function (e) {
                    if (e.key === 'Enter') {
                        const input = e.target;
                        if (input.value.trim()) {
                            signal('ADD')(input.value.trim());
                            input.value = '';
                        }
                    }
                })
            ], []) // <input> is "self-closing"
        ]), // </header>
        render_main(model, signal),
        render_footer(model, signal)
    ]) // <section>
    );
}
/**
 * `subscriptions` let us "listen" for events such as "key press" or "click".
 * and respond according to a pre-defined update/action.
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * both the "update" and "render" functions when invoked with signal(action)
 */
export function subscriptions(signal) {
    const ENTER_KEY = 13; // add a new todo item when [Enter] key is pressed
    const ESCAPE_KEY = 27; // used for "escaping" when editing a Todo item
    document.addEventListener('keyup', function handler(e) {
        // console.log('e.keyCode:', e.keyCode, '| key:', e.key);
        switch (e.keyCode) {
            case ENTER_KEY:
                const editing = document.getElementsByClassName('editing');
                if (editing && editing.length > 0) {
                    signal('SAVE')(); // invoke signal inner callback
                }
                const new_todo = document.getElementById('new-todo');
                if (new_todo.value.length > 0) {
                    signal('ADD')(); // invoke signal inner callback
                    new_todo.value = ''; // reset <input> so we can add another todo
                    document.getElementById('new-todo').focus();
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
export { initial_model, render_item, render_main, render_footer };
//# sourceMappingURL=todo-app.js.map