import { a, button, div, empty, footer, input, h1, header, label, li, mount,
  route, section, span, strong, ul } from './elmish';

// Check if we're in a Node.js environment (for testing)
const isNodeEnvironment = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

interface Todo {
  id: number;
  title: string;
  done: boolean;
}

interface Model {
  todos: Todo[];
  hash: string;
  all_done?: boolean;
  clicked?: number;
  click_time?: number;
  editing?: number;
}

type Action = 'ADD' | 'TOGGLE' | 'TOGGLE_ALL' | 'DELETE' | 'EDIT' | 'SAVE' | 'CANCEL' | 'CLEAR_COMPLETED' | 'ROUTE';

const initial_model: Model = {
  todos: [],
  hash: "#/"
};

/**
 * `update` transforms the `model` based on the `action`.
 * @param {Action} action - the desired action to perform on the model.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {any} data - the data we want to "apply" to the item.
 * @return {Model} new_model - the transformed model.
 */
function update(action: Action, model: Model, data?: any): Model {
  const new_model: Model = JSON.parse(JSON.stringify(model)); // "clone" the model

  switch(action) {
    case 'ADD':
      const last = new_model.todos.length > 0
        ? new_model.todos[new_model.todos.length - 1]
        : null;
      const id = last ? last.id + 1 : 1;
      const input = document.getElementById('new-todo') as HTMLInputElement | null;
      new_model.todos = new_model.todos || [];
      new_model.todos.push({
        id: id,
        title: data || (input ? input.value.trim() : ''),
        done: false
      });
      break;
    case 'TOGGLE':
      new_model.todos.forEach(item => {
        if(item.id === data) {
          item.done = !item.done;
        }
      });
      const all_done = new_model.todos.filter(item => !item.done).length === 0;
      new_model.all_done = all_done;
      break;
    case 'TOGGLE_ALL':
      new_model.all_done = !(new_model.all_done ?? false);
      new_model.todos.forEach(item => {
        item.done = new_model.all_done ?? false;
      });
      break;
    case 'DELETE':
      new_model.todos = new_model.todos.filter(item => item.id !== data);
      break;
    case 'EDIT':
      if (new_model.clicked && new_model.clicked === data &&
        Date.now() - 300 < (new_model.click_time || 0)) {
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
      const value = edit ? edit.value : '';
      const editId = edit ? parseInt(edit.id, 10) : 0;
      new_model.clicked = undefined;
      new_model.editing = undefined;

      if (!value || value.length === 0) {
        return update('DELETE', new_model, editId);
      }
      new_model.todos = new_model.todos.map(item => {
        if (item.id === editId && value && value.length > 0) {
          item.title = value.trim();
        }
        return item;
      });
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

function text(content: string): HTMLElement {
  const span = document.createElement('span');
  span.textContent = content;
  return span;
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
 * @return {HTMLLIElement} <li> DOM Tree which is nested in the <ul>.
 * @example
 * // returns <li> DOM element with <div>, <input>. <label> & <button> nested
 * var DOM = render_item({id: 1, title: "Build Todo List App", done: false}, model, signal);
 */
function render_item (item: Todo, model: Model, signal: Function): HTMLLIElement {
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
        typeof signal === 'function' ? signal('TOGGLE', item.id) : ''
      ] as string[], []),
      label([ typeof signal === 'function' ? signal('EDIT', item.id) : '' ] as string[],
        [text(item.title)]),
      button(["class=destroy",
        typeof signal === 'function' ? signal('DELETE', item.id) : ''
      ] as string[], [])
    ]),
    ...(model.editing === item.id ? [
      input(["class=edit", "id=" + item.id, "value=" + item.title, "autofocus"] as string[], [])
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
function render_main (model: Model, signal: Function): HTMLElement {
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
              return true;
          }
        })
        .map(function (item) {
          return render_item(item, model, signal)
        }) : []
      ) // </ul>
    ]) // </section>
  )
}

/**
 * `render_footer` renders the `<footer class="footer">` of the Todo List App
 * which contains count of items to (still) to be done and a `<ul>` "menu"
 * with links to filter which todo items appear in the list view.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <footer> DOM Tree which containing the footer element.
 * @example
 * // returns <footer> DOM element with other DOM elements nested:
 * var DOM = render_footer(model, signal);
 */
function render_footer (model: Model, signal: Function): HTMLElement {

  // count how many "active" (not yet done) items and completed items
  const completedCount = model.todos.filter(i => i.done).length;
  const activeCount = model.todos.filter(i => !i.done).length;

  // Requirement #1 - No Todos, should hide #footer and #main
  const display = (activeCount > 0 || completedCount > 0) ? "block" : "none";

  // Display clear completed button only if there are completed items
  const display_clear = (completedCount > 0) ? "block" : "none";

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
      ]),
      button(["class=clear-completed", "style=display:" + display_clear,
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
  );
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
 * var DOM = view(model, signal);
 */
function view (model: Model, signal: Function): HTMLElement {

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
function subscriptions (signal: Function): void {
	const ENTER_KEY = 13; // add a new todo item when [Enter] key is pressed
	const ESCAPE_KEY = 27; // used for "escaping" when editing a Todo item

  document.addEventListener('keyup', function handler (e: KeyboardEvent) {
    // console.log('e.keyCode:', e.keyCode, '| key:', e.key);

    switch(e.keyCode) {
      case ENTER_KEY:
        const editing = document.getElementsByClassName('editing');
        if (editing && editing.length > 0) {
          signal('SAVE')(); // invoke signal inner callback
        }

        const new_todo = document.getElementById('new-todo') as HTMLInputElement;
        if(new_todo && new_todo.value.length > 0) {
          signal('ADD')(); // invoke signal inner callback
          new_todo.value = ''; // reset <input> so we can add another todo
          new_todo.focus();
        }
        break;
      case ESCAPE_KEY:
        signal('CANCEL')();
        break;
    }
  });

  window.onhashchange = function route () {
    signal('ROUTE')();
  }
}

/* module.exports is needed to run the functions using Node.js for testing! */
/* istanbul ignore next */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    model: initial_model,
    update: update,
    render_item: render_item,     // export so that we can unit test
    render_main: render_main,     // export for unit testing
    render_footer: render_footer, // export for unit testing
    subscriptions: subscriptions,
    view: view
  }
}
