import { Elmish } from './elmish';

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

export function mount(
  model: Model,
  update: (action: string, model: Model, data?: any) => Model,
  view: (model: Model, signal: (action: string, data?: any) => void) => HTMLElement,
  id: string,
  subscriptions: (signal: (action: string, data?: any) => void) => void
): void {
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
      Elmish.empty(app);
      console.log('Generating view element');
      const viewElement = view(model, signal);
      console.log('View element generated:', viewElement);
      app.appendChild(viewElement);
      console.log('View element appended to app');
    }
  }

  function signal(action: string, data?: any) {
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

const initial_model: Model = {
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
export function update(action: string, model: Model, data?: any): Model {
  const new_model: Model = JSON.parse(JSON.stringify(model));

  switch(action) {
    case 'ADD':
      const last = (new_model.todos.length > 0) ? new_model.todos[new_model.todos.length - 1] : null;
      const id = last ? last.id + 1 : 1;
      const input = document.getElementById('new-todo') as HTMLInputElement;
      console.log('ADD case - input element:', input);
      if (input && input.value.trim()) {
        new_model.todos.push({
          id: id,
          title: input.value.trim(),
          done: false
        });
        console.log('New todo added:', new_model.todos[new_model.todos.length - 1]);
        input.value = ''; // Clear the input after adding
      } else {
        console.error('Could not find input element with id "new-todo" or input is empty');
      }
      break;
    case 'TOGGLE':
      new_model.todos = new_model.todos.map(item =>
        item.id === data ? { ...item, done: !item.done } : item
      );
      new_model.all_done = new_model.todos.every(item => item.done);
      break;
    case 'TOGGLE_ALL':
      if (typeof data === 'boolean') {
        const new_all_done = data;
        if (new_all_done !== new_model.all_done) {
          new_model.all_done = new_all_done;
          new_model.todos = new_model.todos.map(item => ({ ...item, done: new_all_done }));
        }
      } else {
        console.error('TOGGLE_ALL action received invalid data');
        return model; // Return the original model if data is invalid
      }
      break;
    case 'DELETE':
      new_model.todos = new_model.todos.filter(item => item.id !== data);
      break;
    case 'EDIT':
      // this code is inspired by: https://stackoverflow.com/a/16033129/1148249
      // simplified as we are not altering the DOM!
      if (new_model.clicked && new_model.clicked === data &&
        Date.now() - 300 < new_model.click_time!) { // DOUBLE-CLICK < 300ms
          new_model.editing = data;
      }
      else { // first click
        new_model.clicked = data; // so we can check if same item clicked twice!
        new_model.click_time = Date.now(); // timer to detect double-click 300ms
        new_model.editing = undefined; // reset
      }
      break;
    case 'SAVE':
      const edit = document.getElementsByClassName('edit')[0] as HTMLInputElement;
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
      new_model.todos = new_model.todos.filter(item => !item.done);
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
function render_item (item: Todo, model: Model, signal: Function): HTMLElement {
  return Elmish.li([
    "data-id=" + item.id,
    "id=" + item.id,
    item.done ? "class=completed" : "",
    model && model.editing && model.editing === item.id ? "class=editing" : ""
  ], [
    Elmish.div(["class=view"], [
      Elmish.input([
        item.done ? "checked=true" : "",
        "class=toggle",
        "type=checkbox",
        () => signal('TOGGLE', item.id)
      ], []),
      Elmish.label([() => signal('EDIT', item.id)],
        [Elmish.text(item.title)]),
      Elmish.button(["class=destroy",
        () => signal('DELETE', item.id)], [])
    ]),
    ...(model && model.editing && model.editing === item.id ? [
      Elmish.input(["class=edit", "id=" + item.id, "value=" + item.title, "autofocus"], [])
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
function render_main (model: Model, signal: Function): HTMLElement {
  const display = model.hash === '#/' ? 'block' : 'none';
  return Elmish.section(["class=main", "style=display:" + display], [
    Elmish.input([
      "id=toggle-all",
      "class=toggle-all",
      "type=checkbox",
      model.all_done ? "checked=true" : "",
      (function(this: GlobalEventHandlers, ev: MouseEvent) {
        signal('TOGGLE_ALL', !model.all_done);
      }) as Elmish.AttributeValue
    ], []),
    Elmish.label(["for=toggle-all"], [
      Elmish.text("Mark all as complete")
    ]),
    Elmish.ul(["class=todo-list"],
      model.todos
        .filter(function (item) {
          switch(model.hash) {
            case '#/active': return !item.done;
            case '#/completed': return item.done;
            default: return true;
          }
        })
        .map(function (item) {
          return render_item(item, model, signal);
        })
    )
  ]);
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
function render_footer (model: Model, signal: Function): HTMLElement {
  const done = (model.todos && model.todos.length > 0) ?
    model.todos.filter( function (i) { return i.done; }).length : 0;
  const count = (model.todos && model.todos.length > 0) ?
    model.todos.filter( function (i) { return !i.done; }).length : 0;

  const display = (count > 0 || done > 0) ? "block" : "none";
  const display_clear = (done > 0) ? "block" : "none";
  const left = " item" + (count > 1 || count === 0 ? 's' : '') + " left";

  return Elmish.footer(["class=footer", "id=footer", "style=display:" + display], [
    Elmish.span(["class=todo-count", "id=count"], [
      Elmish.strong([], [Elmish.text(count.toString())]),
      Elmish.text(left)
    ]),
    Elmish.ul(["class=filters"], [
      Elmish.li([], [
        Elmish.a([
          "href=#/", "id=all", "class=" +
          (model.hash === '#/' ? "selected" : '')
        ],
        [Elmish.text("All")])
      ]),
      Elmish.li([], [
        Elmish.a([
          "href=#/active", "id=active", "class=" +
          (model.hash === '#/active' ? "selected" : '')
        ],
        [Elmish.text("Active")])
      ]),
      Elmish.li([], [
        Elmish.a([
          "href=#/completed", "id=completed", "class=" +
          (model.hash === '#/completed' ? "selected" : '')
        ],
        [Elmish.text("Completed")])
      ])
    ]),
    Elmish.button(["class=clear-completed", "style=display:" + display_clear,
      (function(this: GlobalEventHandlers, ev: MouseEvent) {
        signal('CLEAR_COMPLETED', {});
      }) as Elmish.AttributeValue
    ], [
      Elmish.text("Clear completed ["),
      Elmish.span(["id=completed-count"], [Elmish.text(done.toString())]),
      Elmish.text("]")
    ])
  ]);
}

/**
 * `view` renders the entire Todo List App
 * which contains count of items to (still) to be done and a `<ul>` "menu"
 * with links to filter which todo items appear in the list view.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {Object} <section> DOM Tree which containing all other DOM elements.
 * @example
 * // returns <section class="todoapp"> DOM element with other DOM els nested:
 * var DOM = view(model);
 */
export function view(model: Model, signal: (action: string, data?: any) => void): HTMLElement {
  return Elmish.section(["class=todoapp"], [
    Elmish.header(["class=header"], [
      Elmish.h1([], [Elmish.text("todos")]),
      Elmish.input([
        "id=new-todo",
        "class=new-todo",
        "placeholder=What needs to be done?",
        "autofocus",
        (ev: MouseEvent) => {
          if ((ev as unknown as KeyboardEvent).key === 'Enter') {
            signal('ADD', null);
          }
        }
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
export function subscriptions (signal: Function): void {
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

mount(initial_model, update, view, 'app', subscriptions);
