import { TodoState, Todo, UpdateFunction, ViewFunction } from './types.js';
import * as elmish from './elmish.js';
const { a, button, div, empty, footer, input, h1, header, label, li, mount,
  route, section, span, strong, text, ul } = elmish;

type Action = 'ADD' | 'TOGGLE' | 'TOGGLE_ALL' | 'DELETE' | 'EDIT' | 'SAVE' | 'CANCEL' | 'CLEAR_COMPLETED' | 'ROUTE';

const initial_model: TodoState = {
  todos: [],
  hash: "#/",
  all_done: false,
  editing: undefined,
  clicked: undefined,
  click_time: undefined
};

/**
 * `update` transforms the `model` based on the `action`.
 * @param {string} action - the desired action to perform on the model.
 * @param {TodoState} model - the App's (current) model (or "state").
 * @param {any} data - the data we want to "apply" to the item.
 * @return {TodoState} new_model - the transformed model.
 */
function update(action: string, model: TodoState, data?: any): TodoState {
  const new_model: TodoState = JSON.parse(JSON.stringify(model)); // "clone" the model

  switch(action) {
    case 'ADD':
      const last = new_model.todos[new_model.todos.length - 1];
      const id = last ? last.id + 1 : 1;
      const title = typeof data === 'string' ? data.trim() : '';
      if (title.length > 0) {
        new_model.todos.push({ id, title, done: false });
      }
      break;
    case 'TOGGLE':
      new_model.todos = new_model.todos.map((item: Todo) =>
        item.id === data ? { ...item, done: !item.done } : item
      );
      new_model.all_done = new_model.todos.every((item: Todo) => item.done);
      break;
    case 'TOGGLE_ALL':
      const newDoneState = !new_model.all_done;
      new_model.all_done = newDoneState;
      new_model.todos = new_model.todos.map((item: Todo) => ({ ...item, done: newDoneState }));
      break;
    case 'DELETE':
      new_model.todos = new_model.todos.filter((item: Todo) => item.id !== data);
      break;
    case 'EDIT':
      if (new_model.clicked === data && new_model.click_time &&
          Date.now() - new_model.click_time < 300) { // DOUBLE-CLICK < 300ms
        new_model.editing = data as number;
      } else { // first click
        new_model.clicked = data as number;
        new_model.click_time = Date.now();
        new_model.editing = undefined;
      }
      break;
    case 'SAVE':
      const editElement = document.getElementsByClassName('edit')[0] as HTMLInputElement;
      if (editElement) {
        const value = editElement.value.trim();
        const editId = parseInt(editElement.id, 10);
        new_model.clicked = undefined;
        new_model.editing = undefined;
        if (value.length === 0) {
          return update('DELETE', new_model, editId);
        }
        new_model.todos = new_model.todos.map((item: Todo) =>
          item.id === editId ? { ...item, title: value } : item
        );
      }
      break;
    case 'CANCEL':
      new_model.clicked = undefined;
      new_model.editing = undefined;
      break;
    case 'CLEAR_COMPLETED':
      new_model.todos = new_model.todos.filter((item: Todo) => !item.done);
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
 * + `<input type=checkbox>` which lets users to "Toggle" the status of the item
 * + `<label>` which displays the Todo item text (`title`) in a `<text>` node
 * + `<button class="destroy">` lets people "delete" a todo item.
 * see: https://github.com/dwyl/learn-elm-architecture-in-javascript/issues/52
 * @param  {Todo} item the todo item object
 * @param {TodoState} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <li> DOM Tree which is nested in the <ul>.
 * @example
 * // returns <li> DOM element with <div>, <input>. <label> & <button> nested
 * const DOM = render_item({id: 1, title: "Build Todo List App", done: false}, model, signal);
 */
function render_item(item: Todo, model: TodoState, signal: (action: Action, data?: any) => void): HTMLElement {
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
        (event: MouseEvent) => signal('TOGGLE', item.id)
      ], []),
      label([(event: MouseEvent) => signal('EDIT', item.id)], [text(item.title)] as unknown as Array<HTMLElement>),
      button(["class=destroy", (event: MouseEvent) => signal('DELETE', item.id)], [])
    ] as Array<HTMLElement>),
    ...(model.editing === item.id ? [
      input(["class=edit", `id=${item.id}`, `value=${item.title}`, "autofocus"], [])
    ] : [])
  ] as Array<HTMLElement>);
}

/**
 * `render_main` renders the `<section class="main">` of the Todo List App
 * which contains all the "main" controls and the `<ul>` with the todo items.
 * @param {TodoState} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <section> DOM Tree which containing the todo list <ul>, etc.
 */
function render_main(model: TodoState, signal: (action: Action, data?: any) => void): HTMLElement {
  // Requirement #1 - No Todos, should hide #footer and #main
  const display = `style=display:${model.todos.length > 0 ? "block" : "none"}`;

  return section(["class=main", "id=main", display], [ // hide if no todo items.
    input(["id=toggle-all", "type=checkbox",
      () => signal('TOGGLE_ALL'),
      (model.all_done ? "checked=checked" : ""),
      "class=toggle-all"
    ] as Array<string | ((event: MouseEvent) => void)>, []),
    label(["for=toggle-all"], [text("Mark all as complete")]),
    ul(["class=todo-list"],
      model.todos.length > 0
        ? model.todos
          .filter((item: Todo) => {
            switch (model.hash) {
              case '#/active':
                return !item.done;
              case '#/completed':
                return item.done;
              default: // if hash doesn't match Active/Completed render ALL todos:
                return true;
            }
          })
          .map((item: Todo) => render_item(item, model, signal))
        : []
    )
  ]);
}

/**
 * `render_footer` renders the `<footer class="footer">` of the Todo List App
 * which contains count of items to (still) to be done and a `<ul>` "menu"
 * with links to filter which todo items appear in the list view.
 * @param {TodoState} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <footer> DOM Tree containing the footer element.
 * @example
 * // returns <footer> DOM element with other DOM elements nested:
 * const DOM = render_footer(model, signal);
 */
function render_footer(model: TodoState, signal: (action: Action, data?: any) => void): HTMLElement {
  // count how many "active" (not yet done) items and completed items
  const activeCount = model.todos.filter((item: Todo) => !item.done).length;
  const completedCount = model.todos.length - activeCount;

  // Requirement #1 - No Todos, should hide #footer and #main
  const display = model.todos.length > 0 ? "block" : "none";

  // Determine if the "Clear completed" button should be displayed
  const displayClear = completedCount > 0 ? "block" : "none";

  // pluralization of number of items:
  const left = ` item${activeCount !== 1 ? 's' : ''} left`;

  return footer(["class=footer", "id=footer", `style=display:${display}`], [
    span(["class=todo-count", "id=count"], [
      strong(activeCount.toString()),
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
    ]),
    button(["class=clear-completed", `style=display:${displayClear}`,
      () => signal('CLEAR_COMPLETED')
    ], [
      text("Clear completed ["),
      span(["id=completed-count"], [
        text(completedCount.toString())
      ]),
      text("]")
    ])
  ]);
}

/**
 * `view` renders the entire Todo List App
 * which contains count of items to (still) to be done and a `<ul>` "menu"
 * with links to filter which todo items appear in the list view.
 * @param {TodoState} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <section> DOM Tree which containing all other DOM elements.
 * @example
 * // returns <section class="todo-app"> DOM element with other DOM els nested:
 * const DOM = view(model, signal);
 */
function view(model: TodoState, signal: (action: Action, data?: any) => void): HTMLElement {
  return section(["class=todoapp"], [ // array of "child" elements
    header(["class=header"], [
      h1([], [
        text("todos")
      ]),
      input([
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
 * @param {(action: Action, data?: any) => void} signal - the Elm Architecture "dispatcher" which will run
 * both the "update" and "render" functions when invoked with signal(action)
 */
function subscriptions(signal: (action: Action, data?: any) => void): void {
  const ENTER_KEY = 13; // add a new todo item when [Enter] key is pressed
  const ESCAPE_KEY = 27; // used for "escaping" when editing a Todo item

  document.addEventListener('keyup', function handler(e: KeyboardEvent) {
    switch (e.keyCode) {
      case ENTER_KEY:
        const editing = document.getElementsByClassName('editing');
        if (editing && editing.length > 0) {
          signal('SAVE', null);
        }

        const new_todo = document.getElementById('new-todo') as HTMLInputElement;
        if (new_todo && new_todo.value.trim().length > 0) {
          signal('ADD', new_todo.value.trim());
          new_todo.value = ''; // reset <input> so we can add another todo
          new_todo.focus();
        }
        break;
      case ESCAPE_KEY:
        signal('CANCEL', null);
        break;
    }
  });

  window.onhashchange = function route() {
    signal('ROUTE', window.location.hash);
  };
}

/* module.exports is needed to run the functions using Node.js for testing! */
/* istanbul ignore next */
const model = initial_model;

// Export necessary functions and variables for initialization
export { Action, initial_model, update, view, subscriptions, model, render_item, render_main, render_footer };
