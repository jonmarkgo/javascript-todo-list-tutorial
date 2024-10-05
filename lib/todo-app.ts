import { Todo } from './types';
import * as elmish from './elmish';

export interface Model {
  todos: Todo[];
  hash: string;
  clicked?: number;
  click_time?: number;
  editing?: number;
  all_done: boolean;
}

const initial_model: Model = {
  todos: [
    { id: 1, title: "Learn Elm Architecture", done: true },
    { id: 2, title: "Build Todo List App", done: false },
    { id: 3, title: "Win at life!", done: false }
  ],
  hash: '#/', // the "route" to display
  clicked: undefined,
  click_time: undefined,
  editing: undefined,
  all_done: false
};

/**
 * `update` transforms the `model` based on the `action`.
 * @param {String} action - the desired action to perform on the model.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {any} data - the data we want to "apply" to the item.
 * @return {Model} new_model - the transformed model.
 */
function update(action: string, model: Model, data?: any): Model {
  const new_model: Model = {
    todos: model.todos ? JSON.parse(JSON.stringify(model.todos)) : [],
    hash: model.hash,
    clicked: model.clicked,
    click_time: model.click_time,
    editing: model.editing,
    all_done: Boolean(model.all_done) // Explicitly cast to boolean
  };

  switch(action) {
    case 'ADD':
      const last = (new_model.todos.length > 0) ? new_model.todos[new_model.todos.length - 1] : null;
      const id = last ? last.id + 1 : 1;
      const input = document.getElementById('new-todo') as HTMLInputElement;
      new_model.todos.push({
        id: id,
        title: data || input.value.trim(),
        done: false
      });
      break;
    case 'TOGGLE':
      new_model.todos.forEach(function (item) {
        if(item.id === data) {
          item.done = !item.done;
        }
      });
      new_model.all_done = new_model.todos.every(item => item.done);
      break;
    case 'TOGGLE_ALL':
      new_model.all_done = !new_model.all_done;
      new_model.todos.forEach(function (item) {
        item.done = new_model.all_done;
      });
      break;
    case 'DELETE':
      new_model.todos = new_model.todos.filter(function (item) {
        return item.id !== data;
      });
      break;
    case 'EDIT':
      new_model.editing = data;
      break;
    case 'SAVE':
      new_model.todos.forEach(function (item) {
        if(item.id === new_model.editing && data) {
          item.title = data.trim();
        }
      });
      new_model.editing = 0;
      break;
    case 'CANCEL':
      new_model.editing = 0;
      break;
    case 'CLEAR_COMPLETED':
      new_model.todos = new_model.todos.filter(function (item) {
        return !item.done;
      });
      break;
    case 'ROUTE':
      new_model.hash = data;
      break;
    default:
      return model;
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
 * @return {HTMLElement} <li> DOM Tree which is nested in the <ul>.
 * @example
 * // returns <li> DOM element with <div>, <input>. <label> & <button> nested
 * var DOM = render_item({id: 1, title: "Build Todo List App", done: false});
 */
function render_item (item: Todo, model: Model, signal: Function): HTMLElement {
  return (
    elmish.li([
      "data-id=" + item.id,
      "id=" + item.id,
      item.done ? "class=completed" : "",
      model && model.editing && model.editing === item.id ? "class=editing" : ""
    ], [
      elmish.div(["class=view"], [
        elmish.input([
          item.done ? "checked=true" : "",
          "class=toggle",
          "type=checkbox",
          typeof signal === 'function' ? signal('TOGGLE', item.id) : null
          ]) as HTMLElement, // <input> does not have any nested elements
        elmish.label([ typeof signal === 'function' ? signal('EDIT', item.id) : null ],
          [elmish.text(item.title)]) as HTMLElement,
        elmish.button(["class=destroy",
          typeof signal === 'function' ? signal('DELETE', item.id) : null], []) as HTMLElement
        ]
      ) as HTMLElement, // </div>

    ].concat(model && model.editing && model.editing === item.id ? [ // editing?
      elmish.input(["class=edit", "id=" + item.id, "value=" + item.title, "autofocus"]) as HTMLElement
    ] : []) // end concat()
    ) as HTMLElement // </li>
  )
}

/**
 * `render_main` renders the `<section class="main">` of the Todo List App
 * which contains all the "main" controls and the `<ul>` with the todo items.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {Object} <section> DOM Tree which containing the todo list <ul>, etc.
 */
function render_main (model: Model, signal: Function): HTMLElement {
  // Requirement #1 - No Todos, should hide #footer and #main
  const display = "style=display:"
    + (model.todos && model.todos.length > 0 ? "block" : "none");

  return (
    elmish.section(["class=main", "id=main", display], [ // hide if no todo items.
      elmish.input([
        "id=toggle-all",
        "type=checkbox",
        typeof signal === 'function' ? signal('TOGGLE_ALL') : null,
        (model.all_done ? "checked=checked" : ""),
        "class=toggle-all"
      ]) as HTMLElement,
      elmish.label(["for=toggle-all"], [ elmish.text("Mark all as complete") ]) as HTMLElement,
      elmish.ul(["class=todo-list"],
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
      ) as HTMLElement
    ]) as HTMLElement
  )
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
function render_footer (model: Model, signal: Function): HTMLElement {

  // count how many "active" (not yet done) items by filtering done === false:
  const done = (model.todos && model.todos.length > 0) ?
    model.todos.filter( function (i) { return i.done; }).length : 0;
  const count = (model.todos && model.todos.length > 0) ?
    model.todos.filter( function (i) { return !i.done; }).length : 0;

  // Requirement #1 - No Todos, should hide #footer and #main
  const display = (count > 0 || done > 0) ? "block" : "none";

  // number of completed items:
  const display_clear =  (done > 0) ? "block;" : "none;";

  // pluralization of number of items:
  const left = (" item" + ( count > 1 || count === 0 ? 's' : '') + " left");

  return (
    elmish.footer(["class=footer", "id=footer", "style=display:" + display], [
      elmish.span(["class=todo-count", "id=count"], [
        elmish.strong([count.toString()], []) as HTMLElement,
        elmish.text(left)
      ]) as HTMLElement,
      elmish.ul(["class=filters"], [
        elmish.li([], [
          elmish.a([
            "href=#/", "id=all", "class=" +
            (model.hash === '#/' ? "selected" : '')
          ],
          [elmish.text("All")]) as HTMLElement
        ]) as HTMLElement,
        elmish.li([], [
          elmish.a([
            "href=#/active", "id=active", "class=" +
            (model.hash === '#/active' ? "selected" : '')
          ],
          [elmish.text("Active")]) as HTMLElement
        ]) as HTMLElement,
        elmish.li([], [
          elmish.a([
            "href=#/completed", "id=completed", "class=" +
            (model.hash === '#/completed' ? "selected" : '')
          ],
          [elmish.text("Completed")]) as HTMLElement
        ]) as HTMLElement
      ]) as HTMLElement, // </ul>
      elmish.button(["class=clear-completed", "style=display:" + display_clear,
        typeof signal === 'function' ? signal('CLEAR_COMPLETED') : null
        ],
        [
          elmish.text("Clear completed ["),
          elmish.span(["id=completed-count"], [
            elmish.text(done.toString())
          ]) as HTMLElement,
          elmish.text("]")
        ]
      ) as HTMLElement
    ]) as HTMLElement
  )
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
function view (model: Model, signal: Function): HTMLElement {

  return (
    elmish.section(["class=todoapp"], [ // array of "child" elements
      elmish.header(["class=header"], [
        elmish.h1([], [
          elmish.text("todos")
        ]) as HTMLElement, // </h1>
        elmish.input([
          "id=new-todo",
          "class=new-todo",
          "placeholder=What needs to be done?",
          "autofocus"
        ]) as HTMLElement // <input> is "self-closing"
      ]) as HTMLElement, // </header>
      render_main(model, signal),
      render_footer(model, signal)
    ]) as HTMLElement // <section>
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
        if(new_todo.value.length > 0) {
          signal('ADD')(); // invoke signal inner callback
          new_todo.value = ''; // reset <input> so we can add another todo
          document.getElementById('new-todo')!.focus();
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

export const TodoApp = {
  mount: elmish.mount,
  update,
  view,
  subscriptions,
  initial_model
};

// For UMD compatibility
if (typeof window !== 'undefined') {
  (window as any).TodoApp = TodoApp;
}

// For testing purposes
const _internal = {
  render_item,
  render_main,
  render_footer
};

export { _internal };
