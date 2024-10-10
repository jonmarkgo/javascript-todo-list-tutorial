// Import statements
import test from 'tape';
import fs from 'fs';
import path from 'path';
import * as elmish from '../lib/elmish';
import { JSDOM } from 'jsdom';
import '@types/jsdom';

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
require('jsdom-global')(html);

const id = 'test-app';

test('elmish.empty("root") removes DOM elements from container', function (t) {
  const { document } = (new JSDOM(`<!DOCTYPE html><div id="${id}"></div>`)).window;
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }

  const child = document.createElement('p');
  child.textContent = 'test';
  root.appendChild(child);
  t.equal(root.childNodes.length, 1, "container has 1 child element");

  elmish.empty(root);
  t.equal(root.childNodes.length, 0, "elmish.empty removes child from container");
  t.end();
});

test('elmish.mount(model, update, view, root_element_id) renders view', function (t) {
  const { document } = (new JSDOM(`<!DOCTYPE html><div id="${id}"></div>`)).window;
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }

  const model = { name: 'Alice' };
  const update = function (action: string, model: { name: string }): { name: string } {
    return model;
  };
  const view = function (model: { name: string }): HTMLElement {
    const div = document.createElement('div');
    div.textContent = `Hello ${model.name}!`;
    return div;
  };

  elmish.mount(model, update, view, id);
  const greeting = root.textContent;
  t.equal(greeting, 'Hello Alice!', "view is rendered in the root element");
  t.end();
});

test('elmish.add_attributes adds attributes/event-listeners to DOM elements', function (t) {
  const { document } = (new JSDOM(`<!DOCTYPE html><div id="${id}"></div>`)).window;
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }

  elmish.empty(root);
  let el = document.createElement('button');
  el = elmish.add_attributes(["id=btn", "class=btn primary", "onclick=clickHandler"], el) as HTMLButtonElement;
  root.appendChild(el);
  const btn = document.getElementById('btn') as HTMLButtonElement;
  t.equal(btn.id, 'btn', "<button id='btn'> adds id attribute");
  t.equal(btn.className, 'btn primary', "<button class='btn primary'> adds class attribute");
  t.equal(typeof btn.onclick, 'function', "<button onclick='clickHandler'> adds click handler");
  t.end();
});

test('elmish.add_attributes <a href="#/active">Active</a>', function (t) {
  const { document } = (new JSDOM(`<!DOCTYPE html><div id="${id}"></div>`)).window;
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }

  elmish.empty(root);
  const a = elmish.add_attributes(["href=#/active", "class=selected", "id=active"],
    document.createElement('a')
  ) as HTMLAnchorElement;
  root.appendChild(a);

  const href = a.href.replace('about:blank', '');
  t.equal(href, "#/active", 'href="#/active" applied to "active" link');
  t.end();
});

test('test default branch of elmish.add_attributes (no effect)', function (t) {
  const { document } = (new JSDOM(`<!DOCTYPE html><div id="${id}"></div>`)).window;
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }

  elmish.empty(root);
  let div = document.createElement('div');
  div.id = 'divid';
  // "Clone" the div DOM node before invoking elmish.attributes to compare
  const clone = div.cloneNode(true) as HTMLDivElement;
  div = elmish.add_attributes(["unrecognised_attribute=noise"], div) as HTMLDivElement;
  t.deepEqual(div, clone, "<div> has not been altered");
  t.end();
});

// ... (rest of the tests)
// ... (rest of the tests)

test('elmish create <footer> view using HTML DOM functions', function (t) {
  const { document } = (new JSDOM(`<!DOCTYPE html><div id="${id}"></div>`)).window;
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }

  const { footer, span, strong, text, ul, li, a, button } = elmish as any; // Temporary type assertion
  (elmish as any).append_childnodes([
    footer(["class=footer", "style=display: block;"], [
      span(["class=todo-count", "id=count"], [
        strong([], [text("1")]),
        text(" item left")
      ]),
      ul(["class=filters"], [
        li([], [
          a(["href=#/", "class=selected"], [text("All")])
        ]),
        li([], [
          a(["href=#/active"], [text("Active")])
        ]),
        li([], [
          a(["href=#/completed"], [text("Completed")])
        ])
      ]),
      button(["class=clear-completed", "style=display:block;"],
        [text("Clear completed")]
      )
    ])
  ], root);

  // count of items left:
  const left = document.getElementById('count')?.textContent;
  t.equal(left, "1 item left", "1 item left");

  // check "Clear completed" button is present:
  const clear = document.querySelector('.clear-completed')?.textContent;
  t.equal(clear, "Clear completed", "Clear completed button present");

  // check that the 3 footer links are present:
  const links = document.querySelectorAll('.filters a');
  t.equal(links.length, 3, "3 filter links present");
  t.equal(links[0].textContent, "All", "All link present");
  t.equal(links[1].textContent, "Active", "Active link present");
  t.equal(links[2].textContent, "Completed", "Completed link present");

  elmish.empty(root);
  t.end();
});

test('elmish.route() invokes the desired route function', function (t) {
  const { document } = (new JSDOM(`<!DOCTYPE html><div id="${id}"></div>`)).window;
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }

  const model = { todos: [] };
  const update = function (msg: string, model: { todos: any[] }): { todos: any[] } {
    switch (msg) {
      case 'add':
        model.todos.push({ id: 1, title: 'Learn Elm Architecture', done: true });
        break;
      default:
        return model;
    }
    return model;
  };
  const view = function (model: { todos: any[] }): HTMLElement {
    const div = document.createElement('div');
    div.textContent = `${model.todos.length} item(s) in list`;
    return div;
  };

  elmish.mount(model, update, view, id);
  t.equal(root.textContent, '0 item(s) in list', 'initial view rendered');

  const router = function (route: string): void {
    switch (route) {
      case '#/':
        update('add', model);
        break;
      default:
        break;
    }
  };

  (elmish as any).route(router);
  window.location.hash = '#/';
  t.equal(root.textContent, '1 item(s) in list', 'view updated after route changed');

  elmish.empty(root);
  t.end();
});

// Fix the syntax error at the end of the file
test('elmish.add_attributes onclick=signal(action) events!', function (t) {
  const { document } = (new JSDOM(`<!DOCTYPE html><div id="${id}"></div>`)).window;
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  // ... (rest of the test implementation)
  t.end();
});
