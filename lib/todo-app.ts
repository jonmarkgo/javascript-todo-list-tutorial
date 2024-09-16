import { TodoModel, TodoItem } from '../types';
import * as elmish from './elmish.js';

const { a, button, div, empty, footer, input, h1, header, label, li, mount,
  route, section, span, strong, text, ul } = elmish;

declare global {
  interface Window {
    require: NodeRequire;
  }
}

export type Action = 'ADD' | 'TOGGLE' | 'TOGGLE_ALL' | 'DELETE' | 'EDIT' | 'SAVE' | 'CANCEL' | 'CLEAR_COMPLETED' | 'ROUTE';

export const initial_model: TodoModel = {
  todos: [],
  hash: "#/",
  all_done: false,
  editing: undefined,
  clicked: undefined,
  click_time: undefined
};

export { TodoModel, TodoItem };

/* istanbul ignore next */
let elmishFunctions: typeof elmish;
if (typeof window !== 'undefined') {
  elmishFunctions = window.require('./elmish.js');
} else {
  elmishFunctions = require('./elmish.js');
}

/**
 * `update` transforms the `model` based on the `action`.
 * @param {Action} action - the desired action to perform on the model.
 * @param {AppModel} model - the App's (current) model (or "state").
 * @param {string | number} data - the data we want to "apply" to the item.
 * @return {AppModel} new_model - the transformed model.
 */
export function update(action: Action, model: AppModel, data?: string | number): AppModel {
  const new_model: AppModel = JSON.parse(JSON.stringify(model)); // "clone" the model

  switch(action) {
    case 'ADD':
      const last = (model.todos.length > 0) ? model.todos[model.todos.length - 1] : null;
      const id = last ? last.id + 1 : 1;
      const input = document.getElementById('new-todo') as HTMLInputElement;
      new_model.todos = new_model.todos.length > 0 ? new_model.todos : [];
      new_model.todos.push({
        id,
        title: (data as string) || input.value.trim(),
        done: false
      });
      break;
    case 'TOGGLE':
      new_model.todos.forEach((item) => { // takes 1ms on a "slow mobile"
        if(item.id === data) {    // this should only "match" one item.
          item.done = !item.done; // invert state of "done" e.g false >> true
        }
      });
      // if all todos are done=true then "check" the "toggle-all" checkbox:
      const all_done = new_model.todos.filter((item) => !item.done).length;
      new_model.all_done = all_done === 0;
      break;
    case 'TOGGLE_ALL':
      new_model.all_done = !(new_model.all_done ?? false);
      new_model.todos.forEach((item) => { // takes 1ms on a "slow mobile"
        item.done = new_model.all_done ?? false;
      });
      break;
    case 'DELETE':
      new_model.todos = new_model.todos.filter((item) => item.id !== data);
      break;
    case 'EDIT':
      // this code is inspired by: https://stackoverflow.com/a/16033129/1148249
      // simplified as we are not altering the DOM!
      if (new_model.clicked && new_model.clicked === data &&
        Date.now() - 300 < (new_model.click_time ?? 0)) { // DOUBLE-CLICK < 300ms
          new_model.editing = data as number;
      }
      else { // first click
        new_model.clicked = data as number; // so we can check if same item clicked twice!
        new_model.click_time = Date.now(); // timer to detect double-click 300ms
        new_model.editing = false; // reset
      }
      break;
    case 'SAVE':
      const edit = document.getElementsByClassName('edit')[0] as HTMLInputElement;
      const value = edit.value;
      const editId = parseInt(edit.id, 10);
      // End Editing
      new_model.clicked = undefined;
      new_model.editing = false;

      if (!value || value.length === 0) { // delete item if title is blank:
        return update('DELETE', new_model, editId);
      }
      // update the value of the item.title that has been edited:
      new_model.todos = new_model.todos.map((item) => {
        if (item.id === editId && value && value.length > 0) {
          item.title = value.trim();
        }
        return item; // return all todo items.
      });
      break;
    case 'CANCEL':
      new_model.clicked = undefined;
      new_model.editing = false;
      break;
    case 'CLEAR_COMPLETED':
      new_model.todos = new_model.todos.filter((item) => !item.done);
      break;
    case 'ROUTE':
      new_model.hash = window.location.hash;
      break;
    default: // if action unrecognised or undefined,
      return model; // return model unmodified
  }   // see: https://softwareengineering.stackexchange.com/a/201786/211301
  return new_model;
}

/**
 * `render_item` creates a DOM "tree" with a single Todo List Item
 * using the "elmish" DOM functions (`li`, `div`, `input`, `label` and `button`)
 * returns an `<li>` HTML element with a nested `<div>` which in turn has the:
 * + `<input type=checkbox>` which lets users to "Toggle" the status of the item
 * + `<label>` which displays the Todo item text (`title`) in a `<text>` node
 * + `<button class="destroy">` lets people "delete" a todo item.
 * see: https://github.com/dwyl/learn-elm-architecture-in-javascript/issues/52
 * @param  {Todo} item the todo item object
 * @param {AppModel} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <li> DOM Tree which is nested in the <ul>.
 * @example
 * // returns <li> DOM element with <div>, <input>. <label> & <button> nested
 * const DOM = render_item({id: 1, title: "Build Todo List App", done: false}, model, signal);
 */
export function render_item(item: Todo, model: AppModel, signal: Function): HTMLElement {
  return li([
    `data-id=${item.id}`,
    `id=${item.id}`,
    item.done ? "class=completed" : "",
    model.editing === item.id ? "class=editing" : ""
  ], [
    div(["class=view"], [
      input([
        item.done ? "checked=true" : "",
        "class=toggle",
        "type=checkbox",
        typeof signal === 'function' ? signal('TOGGLE', item.id) : ''
      ], []), // <input> does not have any nested elements
      label([typeof signal === 'function' ? signal('EDIT', item.id) : ''],
        [text(item.title)]),
      button(["class=destroy",
        typeof signal === 'function' ? signal('DELETE', item.id) : ''])
    ]),
    ...(model.editing === item.id ? [
      input(["class=edit", `id=${item.id}`, `value=${item.title}`, "autofocus"])
    ] : [])
  ]) as HTMLElement;
}

/**
 * `render_main` renders the `<section class="main">` of the Todo List App
 * which contains all the "main" controls and the `<ul>` with the todo items.
 * @param {AppModel} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <section> DOM Tree which containing the todo list <ul>, etc.
 */
export function render_main(model: AppModel, signal: Function): HTMLElement {
  // Requirement #1 - No Todos, should hide #footer and #main
  const display = `style=display:${model.todos.length > 0 ? "block" : "none"}`;

  return section(["class=main", "id=main", display], [ // hide if no todo items.
    input(["id=toggle-all", "type=checkbox",
      typeof signal === 'function' ? signal('TOGGLE_ALL') : '',
      (model.all_done ? "checked=checked" : ""),
      "class=toggle-all"
    ], []),
    label(["for=toggle-all"], [text("Mark all as complete")]),
    ul(["class=todo-list"],
      model.todos.length > 0
        ? model.todos
          .filter((item) => {
            switch (model.hash) {
              case '#/active':
                return !item.done;
              case '#/completed':
                return item.done;
              default: // if hash doesn't match Active/Completed render ALL todos:
                return true;
            }
          })
          .map((item) => render_item(item, model, signal))
        : []
    ) // </ul>
  ]) as HTMLElement; // </section>
}

/**
 * `render_footer` renders the `<footer class="footer">` of the Todo List App
 * which contains count of items to (still) to be done and a `<ul>` "menu"
 * with links to filter which todo items appear in the list view.
 * @param {AppModel} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <section> DOM Tree which containing the <footer> element.
 * @example
 * // returns <footer> DOM element with other DOM elements nested:
 * const DOM = render_footer(model, signal);
 */
export function render_footer(model: AppModel, signal: Function): HTMLElement {
  // count how many "active" (not yet done) items by filtering done === false:
  const done = model.todos.filter((i) => i.done).length;
  const count = model.todos.filter((i) => !i.done).length;

  // Requirement #1 - No Todos, should hide #footer and #main
  const display = (count > 0 || done > 0) ? "block" : "none";

  const display_clear = (done > 0) ? "block;" : "none;";

  // pluralization of number of items:
  const left = ` item${count !== 1 ? 's' : ''} left`;

  return footer(["class=footer", "id=footer", `style=display:${display}`], [
    span(["class=todo-count", "id=count"], [
      strong(count.toString()),
      text(left)
    ]),
    ul(["class=filters"], [
      li([], [
        a([
          "href=#/", "id=all", `class=${model.hash === '#/' ? "selected" : ''}`
        ], [text("All")])
      ]),
      li([], [
        a([
          "href=#/active", "id=active", `class=${model.hash === '#/active' ? "selected" : ''}`
        ], [text("Active")])
      ]),
      li([], [
        a([
          "href=#/completed", "id=completed", `class=${model.hash === '#/completed' ? "selected" : ''}`
        ], [text("Completed")])
      ])
    ]), // </ul>
    button(["class=clear-completed", `style=display:${display_clear}`,
      typeof signal === 'function' ? signal('CLEAR_COMPLETED') : ''
    ], [
      text("Clear completed ["),
      span(["id=completed-count"], [
        text(done.toString())
      ]),
      text("]")
    ])
  ]) as HTMLElement;
}

/**
 * `view` renders the entire Todo List App
 * which contains count of items to (still) to be done and a `<ul>` "menu"
 * with links to filter which todo items appear in the list view.
 * @param {AppModel} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <section> DOM Tree which containing all other DOM elements.
 * @example
 * // returns <section class="todo-app"> DOM element with other DOM els nested:
 * const DOM = view(model, signal);
 */
export function view(model: AppModel, signal: Function): HTMLElement {
  return section(["class=todoapp"], [ // array of "child" elements
    header(["class=header"], [
      h1([], [
        text("todos")
      ]), // </h1>
      input([
        "id=new-todo",
        "class=new-todo",
        "placeholder=What needs to be done?",
        "autofocus"
      ], []) // <input> is "self-closing"
    ]), // </header>
    render_main(model, signal),
    render_footer(model, signal)
  ]) as HTMLElement; // <section>
}

/**
 * `subscriptions` let us "listen" for events such as "key press" or "click".
 * and respond according to a pre-defined update/action.
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * both the "update" and "render" functions when invoked with signal(action)
 */
export function subscriptions(signal: Function): void {
  const ENTER_KEY = 13; // add a new todo item when [Enter] key is pressed
  const ESCAPE_KEY = 27; // used for "escaping" when editing a Todo item

  document.addEventListener('keyup', function handler(e: KeyboardEvent) {
    switch (e.keyCode) {
      case ENTER_KEY:
        const editing = document.getElementsByClassName('editing');
        if (editing && editing.length > 0) {
          signal('SAVE')(); // invoke signal inner callback
        }

        const new_todo = document.getElementById('new-todo') as HTMLInputElement;
        if (new_todo.value.length > 0) {
          signal('ADD')(); // invoke signal inner callback
          new_todo.value = ''; // reset <input> so we can add another todo
          document.getElementById('new-todo')?.focus();
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

/* module.exports is needed to run the functions using Node.js for testing! */
/* istanbul ignore next */
export const model = initial_model;
||||||| 91a96ee
=======
import { TodoModel, TodoItem } from '../types';

declare global {
  interface Window {
    require: NodeRequire;
  }
}

/* istanbul ignore next */
let a: Function, button: Function, div: Function, empty: Function, footer: Function,
    input: Function, h1: Function, header: Function, label: Function, li: Function,
    mount: Function, route: Function, section: Function, span: Function,
    strong: Function, text: Function, ul: Function;

if (typeof window !== 'undefined') {
  ({ a, button, div, empty, footer, input, h1, header, label, li, mount,
    route, section, span, strong, text, ul } = window.require('./elmish.js'));
} else {
  ({ a, button, div, empty, footer, input, h1, header, label, li, mount,
    route, section, span, strong, text, ul } = require('./elmish.js'));
}

export const model: TodoModel = {
  todos: [],
  hash: "#/",
  all_done: false,
  editing: undefined,
  clicked: undefined,
  click_time: undefined
}

export { TodoModel, TodoItem, update, render_item, render_main, render_footer, subscriptions, view };

/**
 * `update` transforms the `model` based on the `action`.
 * @param {String} action - the desired action to perform on the model.
 * @param {TodoModel} model - the App's (current) model (or "state").
 * @param {any} data - the data we want to "apply" to the item.
 * @return {TodoModel} new_model - the transformed model.
 */
function update(action: string, model: TodoModel, data?: any): TodoModel {
  const new_model: TodoModel = JSON.parse(JSON.stringify(model)); // "clone" the model

  switch(action) {
    case 'ADD':
      const title = typeof data === 'string' ? data.trim() : '';
      if (title.length > 0) {
        const last = new_model.todos.length > 0 ? new_model.todos[new_model.todos.length - 1] : null;
        const id = last ? last.id + 1 : 1;
        new_model.todos.push({
          id: id,
          title: title,
          done: false
        });
      }
      break;
    case 'TOGGLE':
      new_model.todos = new_model.todos.map(item =>
        item.id === data ? { ...item, done: !item.done } : item
      );
      new_model.all_done = new_model.todos.every(item => item.done);
      break;
    case 'TOGGLE_ALL':
      const newDoneState = !new_model.all_done;
      new_model.all_done = newDoneState;
      new_model.todos = new_model.todos.map(item => ({ ...item, done: newDoneState }));
      break;
    case 'DELETE':
      new_model.todos = new_model.todos.filter(item => item.id !== data);
      break;
    case 'EDIT':
      if (new_model.clicked && new_model.clicked === data &&
        new_model.click_time && Date.now() - 300 < new_model.click_time) { // DOUBLE-CLICK < 300ms
          new_model.editing = data;
      }
      else { // first click
        new_model.clicked = data;
        new_model.click_time = Date.now();
        new_model.editing = undefined;
      }
      break;
    case 'SAVE':
      const editElement = document.getElementsByClassName('edit')[0] as HTMLInputElement | null;
      if (editElement) {
        const value = editElement.value.trim();
        const id = parseInt(editElement.id, 10);
        new_model.clicked = undefined;
        new_model.editing = undefined;

        if (value.length === 0) {
          return update('DELETE', new_model, id);
        }
        new_model.todos = new_model.todos.map(item =>
          item.id === id ? { ...item, title: value } : item
        );
      }
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
      return model; // return model unmodified
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
 * @param  {TodoItem} item the todo item object
 * @param {TodoModel} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <li> DOM Tree which is nested in the <ul>.
 * @example
 * // returns <li> DOM element with <div>, <input>. <label> & <button> nested
 * var DOM = render_item({id: 1, title: "Build Todo List App", done: false}, model, signal);
 */
function render_item(item: TodoItem, model: TodoModel, signal?: (action: string, data?: any) => void): HTMLElement {
  return (
    li([
      `data-id=${item.id}`,
      `id=${item.id}`,
      item.done ? "class=completed" : "",
      model.editing === item.id ? "class=editing" : ""
    ], [
      div(["class=view"], [
        input([
          item.done ? "checked=true" : "",
          "class=toggle",
          "type=checkbox",
          typeof signal === 'function' ? signal('TOGGLE', item.id) : ''
        ], []), // <input> does not have any nested elements
        label([typeof signal === 'function' ? signal('EDIT', item.id) : ''],
          [text(item.title)]),
        button(["class=destroy",
          typeof signal === 'function' ? signal('DELETE', item.id) : ''])
      ]
      ), // </div>

    ].concat(model.editing === item.id ? [ // editing?
      input(["class=edit", `id=${item.id}`, `value=${item.title}`, "autofocus"])
    ] : []) // end concat()
    ) // </li>
  )
}

/**
 * `render_main` renders the `<section class="main">` of the Todo List App
 * which contains all the "main" controls and the `<ul>` with the todo items.
 * @param {Object} model - the App's (current) model (or "state").
 * @param {Function} singal - the Elm Architicture "dispacher" which will run
 * @return {Object} <section> DOM Tree which containing the todo list <ul>, etc.
 */
function render_main (model, signal) {
  // Requirement #1 - No Todos, should hide #footer and #main
  var display = "style=display:"
    + (model.todos && model.todos.length > 0 ? "block" : "none");

  return (
    section(["class=main", "id=main", display], [ // hide if no todo items.
      input(["id=toggle-all", "type=checkbox",
        typeof signal === 'function' ? signal('TOGGLE_ALL') : '',
        (model.all_done ? "checked=checked" : ""),
        "class=toggle-all"
      ], []),
      label(["for=toggle-all"], [ text("Mark all as complete") ]),
      ul(["class=todo-list"],
        (model.todos && model.todos.length > 0) ?
        model.todos
        .filter(function (item) {
          switch(model.hash) {
            case '#/active':
              return !item.done;
            case '#/completed':
              return item.done;
            default: // if hash doesn't match Active/Completed render ALL todos:
              return item;
          }
        })
        .map(function (item) {
          return render_item(item, model, signal)
        }) : null
      ) // </ul>
    ]) // </section>
  )
}

/**
 * `render_footer` renders the `<footer class="footer">` of the Todo List App
 * which contains count of items to (still) to be done and a `<ul>` "menu"
 * with links to filter which todo items appear in the list view.
 * @param {TodoModel} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <footer> DOM Tree containing the footer element.
 * @example
 * // returns <footer> DOM element with other DOM elements nested:
 * var DOM = render_footer(model, signal);
 */
function render_footer(model: TodoModel, signal: (action: string, data?: any) => void): HTMLElement {

  // count how many "active" (not yet done) items and completed items
  const activeCount = model.todos.filter(item => !item.done).length;
  const completedCount = model.todos.length - activeCount;

  // Requirement #1 - No Todos, should hide #footer and #main
  const display = model.todos.length > 0 ? "block" : "none";

  // Determine if the "Clear completed" button should be displayed
  const displayClear = completedCount > 0 ? "block" : "none";

  // pluralization of number of items:
  const left = ` item${activeCount !== 1 ? 's' : ''} left`;

  return (
    footer(["class=footer", "id=footer", "style=display:" + display], [
      span(["class=todo-count", "id=count"], [
        strong(activeCount.toString()),
        text(left)
      ]),
      ul(["class=filters"], [
        li([], [
          a([
            "href=#/", "id=all", "class=" +
            (model.hash === '#/' ? "selected" : '')
          ],
          [text("All")])
        ]),
        li([], [
          a([
            "href=#/active", "id=active", "class=" +
            (model.hash === '#/active' ? "selected" : '')
          ],
          [text("Active")])
        ]),
        li([], [
          a([
            "href=#/completed", "id=completed", "class=" +
            (model.hash === '#/completed' ? "selected" : '')
          ],
          [text("Completed")])
        ])
      ]), // </ul>
      button(["class=clear-completed", "style=display:" + displayClear,
        typeof signal === 'function' ? signal('CLEAR_COMPLETED') : ''
        ],
        [
          text("Clear completed ["),
          span(["id=completed-count"], [
            text(completedCount.toString())
          ]),
          text("]")
        ]
      )
    ])
  )
}

/**
 * `view` renders the entire Todo List App
 * which contains count of items to (still) to be done and a `<ul>` "menu"
 * with links to filter which todo items appear in the list view.
 * @param {Object} model - the App's (current) model (or "state").
 * @param {Function} singal - the Elm Architicture "dispacher" which will run
 * @return {Object} <section> DOM Tree which containing all other DOM elements.
 * @example
 * // returns <section class="todo-app"> DOM element with other DOM els nested:
 * var DOM = view(model);
 */
function view (model, signal) {

  return (
    section(["class=todoapp"], [ // array of "child" elements
      header(["class=header"], [
        h1([], [
          text("todos")
        ]), // </h1>
        input([
          "id=new-todo",
          "class=new-todo",
          "placeholder=What needs to be done?",
          "autofocus"
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
function subscriptions(signal: (action: string, data?: any) => void): void {
	const ENTER_KEY = 13; // add a new todo item when [Enter] key is pressed
	const ESCAPE_KEY = 27; // used for "escaping" when editing a Todo item

  document.addEventListener('keyup', function handler (e: KeyboardEvent) {
    switch(e.keyCode) {
      case ENTER_KEY:
        const editing = document.getElementsByClassName('editing');
        if (editing && editing.length > 0) {
          signal('SAVE');
        }

        const new_todo = document.getElementById('new-todo') as HTMLInputElement | null;
        if(new_todo && new_todo.value.length > 0) {
          signal('ADD');
          new_todo.value = ''; // reset <input> so we can add another todo
          new_todo.focus();
        }
        break;
      case ESCAPE_KEY:
        signal('CANCEL');
        break;
    }
  });

  window.onhashchange = function route () {
    signal('ROUTE');
  }
}

// Export all necessary functions and variables for testing and usage
>>>>>>> origin/devin/typescript-migration-todo-app.test
