"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = update;
exports.view = view;
exports.subscriptions = subscriptions;
const elmish_1 = require("./elmish");
const initial_model = {
    todos: [],
    hash: '#/'
};
function update(action, model, data) {
    const new_model = JSON.parse(JSON.stringify(model));
    switch (action) {
        case 'ADD':
            const last = (model.todos.length > 0) ? model.todos[model.todos.length - 1] : null;
            const id = last ? last.id + 1 : 1;
            const input = document.getElementById('new-todo');
            new_model.todos = (new_model.todos && new_model.todos.length > 0)
                ? new_model.todos : [];
            new_model.todos.push({
                id: id,
                title: data || (input ? input.value.trim() : ''),
                completed: false
            });
            break;
        case 'TOGGLE':
            new_model.todos.forEach(function (item) {
                if (item.id === data) {
                    item.completed = !item.completed;
                }
            });
            const all_completed = new_model.todos.every(item => item.completed);
            new_model.all_done = all_completed;
            break;
        case 'TOGGLE_ALL':
            new_model.all_done = !new_model.all_done;
            new_model.todos.forEach(function (item) {
                item.completed = new_model.all_done || false;
            });
            break;
        case 'DELETE':
            new_model.todos = new_model.todos.filter(function (item) {
                return item.id !== data;
            });
            break;
        case 'EDIT':
            if (new_model.clicked && new_model.clicked === data &&
                new_model.click_time && Date.now() - 300 < new_model.click_time) {
                new_model.editing = data;
            }
            else {
                new_model.clicked = data;
                new_model.click_time = Date.now();
                new_model.editing = false;
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
                if (item.id === editId) {
                    item.title = value;
                }
                return item;
            });
            break;
        case 'CANCEL':
            new_model.clicked = undefined;
            new_model.editing = undefined;
            break;
        case 'CLEAR_COMPLETED':
            new_model.todos = new_model.todos.filter(function (item) {
                return !item.completed;
            });
            break;
        case 'ROUTE':
            new_model.hash = window.location.hash;
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
 */
function render_item(item, model) {
    return ((0, elmish_1.li)([
        "data-id=" + item.id,
        "class=" + (item.completed ? "completed" : ""),
        (model.editing === item.id ? "class=editing" : "")
    ], [
        (0, elmish_1.div)(["class=view"], [
            (0, elmish_1.input)([
                "class=toggle",
                "type=checkbox",
                item.completed ? "checked=checked" : "",
                () => ({ type: 'TOGGLE', id: item.id })
            ], []),
            (0, elmish_1.label)([() => ({ type: 'EDIT', id: item.id })], [(0, elmish_1.text)(item.title)]),
            (0, elmish_1.button)(["class=destroy", () => ({ type: 'DELETE', id: item.id })], [])
        ]),
        (0, elmish_1.input)([
            "class=edit",
            "value=" + item.title,
            () => ({ type: 'SAVE', id: item.id })
        ], [])
    ]));
}
function render_main(model) {
    const display = model.todos.length ? "block" : "none";
    return ((0, elmish_1.section)(["class=main", "style=display:" + display], [
        (0, elmish_1.input)([
            "id=toggle-all",
            "class=toggle-all",
            "type=checkbox",
            model.all_done ? "checked=checked" : "",
            () => ({ type: 'TOGGLE_ALL' })
        ], []),
        (0, elmish_1.label)(["for=toggle-all"], [(0, elmish_1.text)("Mark all as complete")]),
        (0, elmish_1.ul)(["class=todo-list"], model.todos
            .filter(function (item) {
            switch (model.hash) {
                case '#/active':
                    return !item.completed;
                case '#/completed':
                    return item.completed;
                default:
                    return true;
            }
        })
            .map(item => render_item(item, model)))
    ]));
}
function render_header(model) {
    return ((0, elmish_1.header)(["class=header"], [
        (0, elmish_1.h1)([], [(0, elmish_1.text)("todos")]),
        (0, elmish_1.input)([
            "class=new-todo",
            "placeholder=What needs to be done?",
            "autofocus",
            () => ({ type: 'ADD' })
        ], [])
    ]));
}
function render_footer(model) {
    const { todos, hash } = model;
    const count = todos.filter(todo => !todo.completed).length;
    const done = todos.length - count;
    const display = (count > 0 || done > 0) ? "block" : "none";
    const display_clear = (done > 0) ? "block" : "none";
    return ((0, elmish_1.footer)(["class=footer", "id=footer", "style=display:" + display], [
        (0, elmish_1.span)(["class=todo-count", "id=count"], [
            (0, elmish_1.strong)(count.toString()),
            (0, elmish_1.text)(count === 1 ? " item left" : " items left")
        ]),
        (0, elmish_1.ul)(["class=filters"], [
            (0, elmish_1.li)([], [
                (0, elmish_1.a)([
                    "href=#/", "id=all", "class=" +
                        (hash === '#/' ? "selected" : '')
                ], [(0, elmish_1.text)("All")])
            ]),
            (0, elmish_1.li)([], [
                (0, elmish_1.a)([
                    "href=#/active", "id=active", "class=" +
                        (hash === '#/active' ? "selected" : '')
                ], [(0, elmish_1.text)("Active")])
            ]),
            (0, elmish_1.li)([], [
                (0, elmish_1.a)([
                    "href=#/completed", "id=completed", "class=" +
                        (hash === '#/completed' ? "selected" : '')
                ], [(0, elmish_1.text)("Completed")])
            ])
        ]),
        (0, elmish_1.button)([
            "class=clear-completed",
            "style=display:" + display_clear,
            () => ({ type: 'CLEAR_COMPLETED' })
        ], [(0, elmish_1.text)("Clear completed")])
    ]));
}
function view(model) {
    return ((0, elmish_1.section)(["class=todoapp"], [
        render_header(model),
        render_main(model),
        render_footer(model)
    ]));
}
function subscriptions(model) {
    window.onhashchange = function () {
        return update('ROUTE', model, window.location.hash);
    };
}
//# sourceMappingURL=todo-app.js.map