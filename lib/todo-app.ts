console.log('todo-app.ts script is executing');
import * as elmish from './elmish';
import { mount } from './elmish';

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
  input: string;
}

const initial_model: Model = {
  todos: [],
  hash: '',
  input: ''
};

export function init(): Model {
  return { ...initial_model };
}

export function update(action: Action, model: Model): Model {
  switch (action.type) {
    case 'ADD':
      return { ...model, todos: [...model.todos, { id: Date.now(), title: action.text, done: false }] };
    case 'TOGGLE':
      return { ...model, todos: model.todos.map(todo => todo.id === action.id ? { ...todo, done: !todo.done } : todo) };
    case 'DESTROY':
      return { ...model, todos: model.todos.filter(todo => todo.id !== action.id) };
    case 'CLEAR_COMPLETED':
      return { ...model, todos: model.todos.filter(todo => !todo.done) };
    case 'TOGGLE_ALL':
      const allDone = model.todos.every(todo => todo.done);
      return { ...model, todos: model.todos.map(todo => ({ ...todo, done: !allDone })) };
    case 'UPDATE_INPUT':
      return { ...model, input: action.text };
    case 'EDIT':
      return { ...model, editing: action.id };
    case 'SAVE':
      return { ...model, todos: model.todos.map(todo => todo.id === action.id ? { ...todo, title: action.text } : todo), editing: undefined };
    case 'CANCEL':
      return { ...model, editing: undefined };
    case 'SET_HASH':
      return { ...model, hash: action.hash };
    default:
      return model;
  }
}

// Add update function to global window object
if (typeof window !== 'undefined') {
  (window as any).update = update;
}

export function render_item(todo: Todo, model: Model, signal: elmish.SignalFunction<Action>): HTMLElement {
  return elmish.li([todo.done ? "class=completed" : ""], [
    elmish.div(["class=view"], [
      elmish.input(["class=toggle", "type=checkbox", todo.done ? "checked=true" : "",
        (e: Event) => signal({ type: 'TOGGLE', id: todo.id })], []),
      elmish.label([], [elmish.text(todo.title)]),
      elmish.button(["class=destroy", (e: Event) => signal({ type: 'DESTROY', id: todo.id })], [])
    ])
  ]);
}

export function render_main(model: Model, signal: elmish.SignalFunction<Action>): HTMLElement {
  return elmish.section(["class=main"], [
    elmish.input(["id=toggle-all", "class=toggle-all", "type=checkbox",
      model.todos.every(todo => todo.done) ? "checked=true" : "",
      (e: Event) => signal({ type: 'TOGGLE_ALL' })], []),
    elmish.label(["for=toggle-all"], [elmish.text("Mark all as complete")]),
    elmish.ul(["class=todo-list"],
      model.todos.map(todo => render_item(todo, model, signal))
    )
  ]);
}

export function render_footer(model: Model, signal: elmish.SignalFunction<Action>): HTMLElement {
  const activeCount = model.todos.filter(todo => !todo.done).length;
  const completedCount = model.todos.length - activeCount;

  return elmish.footer(["class=footer"], [
    elmish.span(["class=todo-count"], [
      elmish.strong(activeCount.toString()),
      elmish.text(` item${activeCount === 1 ? '' : 's'} left`)
    ]),
    elmish.button(
      ["class=clear-completed",
       completedCount > 0 ? "" : "style=display:none",
       (e: Event) => signal({ type: 'CLEAR_COMPLETED' })
      ],
      [elmish.text(`Clear completed (${completedCount})`)]
    )
  ]);
}

// Remove duplicate function implementation and ensure correct export
export function view(model: Model, signal: elmish.SignalFunction<Action>): HTMLElement {
  return (
    elmish.section(["class=todoapp"], [
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
    ])
  );
}

// Removed duplicate implementations of render_main and render_footer
// as they are already defined and exported above

// Initialize the application
// Note: initial_model, update, and mount need to be defined elsewhere in the file
mount(initial_model, update, view, 'todo-app', subscriptions);

// The render_main function is already defined earlier, so we'll remove the duplicate implementation here.

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
// The render_footer function is already defined earlier, so we'll remove the duplicate implementation here.

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
// The view function is already defined earlier, so we remove this duplicate implementation

/**
 * `subscriptions` let us "listen" for events such as "key press" or "click".
 * and respond according to a pre-defined update/action.
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * both the "update" and "render" functions when invoked with signal(action)
 */
// The subscriptions function is already defined earlier, so we remove this duplicate implementation

/* module.exports is needed to run the functions using Node.js for testing! */
/* istanbul ignore next */
// Removed duplicate implementation of render_item

/* if require fn is available, it means we are in Node.js Land i.e. testing! */
/* istanbul ignore next */
if (typeof window === 'undefined' && typeof require !== 'undefined') {
  const { a, button, div, empty, footer, input, h1, header, mount,
    section, li, label, text, ul, span, strong } = require('./elmish.js') as typeof import('./elmish.js');
}
import type { Action, SignalFunction } from './todo-app.d';

// These interfaces are already defined at the beginning of the file
// Removing duplicate exports
export type { Action, SignalFunction };

// Remove conflicting imports
// import type { Action, SignalFunction } from './todo-app.d';







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
// The render_item function is already defined earlier, so we remove this duplicate implementation

/**
 * `render_main` renders the `<section class="main">` of the Todo List App
 * which contains all the "main" controls and the `<ul>` with the todo items.
 * @param {Model} model - the App's (current) model (or "state").
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * @return {HTMLElement} <section> DOM Tree which containing the todo list <ul>, etc.
 */
// The render_main function is already defined earlier, so we remove this duplicate implementation

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
// The render_footer function is already defined earlier, so we remove this duplicate implementation

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
// The view function is already defined earlier, so we remove this duplicate implementation

/**
 * `subscriptions` let us "listen" for events such as "key press" or "click".
 * and respond according to a pre-defined update/action.
 * @param {Function} signal - the Elm Architecture "dispatcher" which will run
 * both the "update" and "render" functions when invoked with signal(action)
 */
export function subscriptions (signal: SignalFunction<Action>): void {
	const ENTER_KEY = 13; // add a new todo item when [Enter] key is pressed
	const ESCAPE_KEY = 27; // used for "escaping" when editing a Todo item

  document.addEventListener('keyup', function handler (e: KeyboardEvent) {
    // console.log('e.keyCode:', e.keyCode, '| key:', e.key);

    switch(e.keyCode) {
      case ENTER_KEY:
        const editing = document.getElementsByClassName('editing');
        if (editing && editing.length > 0) {
          const editingElement = editing[0] as HTMLElement;
          const id = parseInt(editingElement.dataset.id || '0', 10);
          const text = (editingElement.querySelector('input.edit') as HTMLInputElement).value;
          signal({ type: 'SAVE', id, text });
        }

        const new_todo = document.getElementById('new-todo') as HTMLInputElement;
        if(new_todo.value.length > 0) {
          signal({ type: 'ADD', text: new_todo.value });
          new_todo.value = ''; // reset <input> so we can add another todo
          document.getElementById('new-todo')!.focus();
        }
        break;
      case ESCAPE_KEY:
        const editingEscape = document.getElementsByClassName('editing')[0] as HTMLElement;
        const escapeId = parseInt(editingEscape?.dataset.id || '0', 10);
        signal({ type: 'CANCEL', id: escapeId });
        break;
    }
  });

  window.onhashchange = function route () {
    signal({ type: 'SET_HASH', hash: window.location.hash });
  };
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

// Add update function to global window object
if (typeof window !== 'undefined') {
  (window as any).update = update;
}
