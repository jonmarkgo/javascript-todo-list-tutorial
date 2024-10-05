import { text, strong, footer, span, ul, li, a, button, div, empty, input, h1, header, label, mount,
  route, section } from './elmish';

interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

interface Model {
  todos: Todo[];
  hash: string;
  all_done?: boolean;
  clicked?: number;
  click_time?: number;
  editing?: number | false;
}

const initial_model: Model = {
  todos: [],
  hash: '#/'
};

function update(action: string, model: Model, data?: any): Model {
  const new_model: Model = JSON.parse(JSON.stringify(model));

  switch(action) {
    case 'ADD':
      const last = (model.todos.length > 0) ? model.todos[model.todos.length - 1] : null;
      const id = last ? last.id + 1 : 1;
      const input = document.getElementById('new-todo') as HTMLInputElement;
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
        if(item.id === data) {
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
 */
function render_item(item: Todo, model: Model): HTMLElement {
  return (
    li([
      "data-id=" + item.id,
      "class=" + (item.completed ? "completed" : ""),
      (model.editing === item.id ? "class=editing" : "")
    ], [
      div(["class=view"], [
        input([
          "class=toggle",
          "type=checkbox",
          item.completed ? "checked=checked" : "",
          () => ({ type: 'TOGGLE', id: item.id })
        ], []),
        label([() => ({ type: 'EDIT', id: item.id })],
          [text(item.title)]
        ),
        button(["class=destroy", () => ({ type: 'DELETE', id: item.id })], [])
      ]),
      input([
        "class=edit",
        "value=" + item.title,
        () => ({ type: 'SAVE', id: item.id })
      ], [])
    ])
  );
}

function render_main(model: Model): HTMLElement {
  const display = model.todos.length ? "block" : "none";
  return (
    section(["class=main", "style=display:" + display], [
      input([
        "id=toggle-all",
        "class=toggle-all",
        "type=checkbox",
        model.all_done ? "checked=checked" : "",
        () => ({ type: 'TOGGLE_ALL' })
      ], []),
      label(["for=toggle-all"], [text("Mark all as complete")]),
      ul(["class=todo-list"],
        model.todos
        .filter(function (item) {
          switch(model.hash) {
            case '#/active':
              return !item.completed;
            case '#/completed':
              return item.completed;
            default:
              return true;
          }
        })
        .map(item => render_item(item, model))
      )
    ])
  );
}

function render_header(model: Model): HTMLElement {
  return (
    header(["class=header"], [
      h1([], [text("todos")]),
      input([
        "class=new-todo",
        "placeholder=What needs to be done?",
        "autofocus",
        () => ({ type: 'ADD' })
      ], [])
    ])
  );
}

function render_footer(model: Model): HTMLElement {
  const { todos, hash } = model;
  const count = todos.filter(todo => !todo.completed).length;
  const done = todos.length - count;
  const display = (count > 0 || done > 0) ? "block" : "none";
  const display_clear = (done > 0) ? "block" : "none";

  return (
    footer(["class=footer", "id=footer", "style=display:" + display], [
      span(["class=todo-count", "id=count"], [
        strong(count.toString()),
        text(count === 1 ? " item left" : " items left")
      ]),
      ul(["class=filters"], [
        li([], [
          a([
            "href=#/", "id=all", "class=" +
            (hash === '#/' ? "selected" : '')
          ],
          [text("All")])
        ]),
        li([], [
          a([
            "href=#/active", "id=active", "class=" +
            (hash === '#/active' ? "selected" : '')
          ],
          [text("Active")])
        ]),
        li([], [
          a([
            "href=#/completed", "id=completed", "class=" +
            (hash === '#/completed' ? "selected" : '')
          ],
          [text("Completed")])
        ])
      ]),
      button([
        "class=clear-completed",
        "style=display:" + display_clear,
        () => ({ type: 'CLEAR_COMPLETED' })
      ],
      [text("Clear completed")])
    ])
  );
}

function view(model: Model): HTMLElement {
  return (
    section(["class=todoapp"], [
      render_header(model),
      render_main(model),
      render_footer(model)
    ])
  );
}

function subscriptions(model: Model): void {
  window.onhashchange = function() {
    return update('ROUTE', model, window.location.hash);
  };
}

export {
  update,
  view,
  subscriptions
};
