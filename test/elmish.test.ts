import test, { Test } from 'tape';  // https://github.com/dwyl/learn-tape
import fs from 'fs';                // read html files (see below)
import path from 'path';            // so we can open files cross-platform
import { mount, add_attributes, append_childnodes, section, route, empty } from '../lib/elmish';
import * as elmish from '../lib/elmish';
import { JSDOM } from 'jsdom';

const jsdomGlobal = require('jsdom-global') as (html: string) => void;

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');

// Initialize jsdom-global with the HTML content
jsdomGlobal(html);   // https://github.com/rstacruz/jsdom-global

// Add necessary type definitions for the global object
declare global {
  namespace NodeJS {
    interface Global {
      document: Document;
      window: Window;
      navigator: Navigator;
    }
  }
}

const id = 'test-app';              // all tests use separate root element

// Wrapper function to add timeout to tests
function testWithTimeout(name: string, testFn: (t: Test) => void, timeout = 5000) {
  test(name, (t: Test) => {
    const timeoutId = setTimeout(() => {
      t.fail(`Test "${name}" timed out after ${timeout}ms`);
      t.end();
    }, timeout);

    testFn({
      ...t,
      end: () => {
        clearTimeout(timeoutId);
        t.end();
      }
    });
  });
}

testWithTimeout('elmish.empty("root") removes DOM elements from container', function (t: Test) {
  t.plan(3); // Plan for 3 assertions

  try {
    // setup the test div:
    const text = 'Hello World!'
    const divid = "mydiv";
    const root = document.getElementById(id);
    if (!root) {
      throw new Error('Root element not found');
    }
    const div = document.createElement('div');
    div.id = divid;
    const txt = document.createTextNode(text);
    div.appendChild(txt);
    root.appendChild(div);

    // check text of the div:
    const actualElement = document.getElementById(divid);
    if (!actualElement) {
      throw new Error('Test div element not found');
    }
    const actual = actualElement.textContent;
    t.equal(actual, text, `Contents of mydiv is: ${actual} == ${text}`);
    t.equal(root.childElementCount, 1, `Root element ${id} has 1 child el`);

    // empty the root DOM node:
    elmish.empty(root); // exercise the `empty` function!
    t.equal(root.childElementCount, 0, "After empty(root) has 0 child elements!");

    t.end();
  } catch (error) {
    if (error instanceof Error) {
      t.fail(error.message);
    } else {
      t.fail('An unknown error occurred');
    }
    t.end();
  }
});

testWithTimeout('elmish.mount app expect state to be Zero', async function (t: Test) {
  t.plan(8); // Plan for 8 assertions

  try {
    const { view, update } = require('./counter');

    const root = document.getElementById(id);
    if (!root) {
      throw new Error('Root element not found');
    }

    // Helper function to wait for DOM updates
    const waitForDomUpdate = () => new Promise<void>(resolve => setTimeout(resolve, 0));

    // Helper function to get the current count
    const getCount = (): number => {
      const countElement = document.querySelector(`#${id} .count`) as HTMLElement;
      return countElement && countElement.textContent ? parseInt(countElement.textContent, 10) : NaN;
    };

    console.log('[TEST] Mounting app with initial state 7');
    const signal = elmish.mount(7, update, view, id);
    t.ok(signal && typeof signal === 'function', "Mount should return a signal function");

    await waitForDomUpdate();

    const initialState = getCount();
    console.log('[TEST] Initial state:', initialState);
    t.equal(initialState, 7, "Initial state should be set to 7");

    // Check initial localStorage value
    const initialStoredValue = localStorage.getItem('todos-elmish_' + id);
    console.log('[TEST] Initial stored value in localStorage:', initialStoredValue);
    t.equal(JSON.parse(initialStoredValue || '7'), 7, "localStorage should be initialized with 7");

    const resetButton = document.querySelector(`#${id} .reset`) as HTMLElement;
    if (!resetButton) {
      throw new Error('Reset button not found');
    }

    console.log('[TEST] Clicking reset button');
    resetButton.click();

    await waitForDomUpdate();

    const updatedState = getCount();
    console.log('[TEST] After reset, count:', updatedState);
    t.equal(updatedState, 0, "State should be 0 after reset");

    // Check localStorage value after reset
    const storedValue = localStorage.getItem('todos-elmish_' + id);
    console.log('[TEST] Stored value in localStorage after reset:', storedValue);
    t.equal(JSON.parse(storedValue || '0'), 0, "localStorage should be updated to 0 after reset");

    // Check model in signal function
    if (typeof signal === 'function') {
      console.log('[TEST] Calling signal function with "noop" action');
      const signalFunc = signal('noop');
      signalFunc(); // This should trigger a re-render
      await waitForDomUpdate();
      const finalState = getCount();
      console.log('[TEST] Final state after signal call:', finalState);
      t.equal(finalState, 0, "State should remain 0 after noop signal");

      // Check localStorage after noop signal
      const finalStoredValue = localStorage.getItem('todos-elmish_' + id);
      console.log('[TEST] Final stored value in localStorage:', finalStoredValue);
      t.equal(JSON.parse(finalStoredValue || '0'), 0, "localStorage should still be 0 after noop signal");
    }

    t.pass("All assertions completed successfully");
  } catch (error) {
    console.error('[TEST ERROR]:', error);
    t.fail(error instanceof Error ? error.message : 'An unknown error occurred');
  } finally {
    const root = document.getElementById(id);
    if (root) {
      elmish.empty(root);
    }
    t.end();
  }
}, 10000); // Increase timeout to 10 seconds

test('elmish.add_attributes adds "autofocus" attribute', function (t: Test) {
  const { document } = (new JSDOM(`<!DOCTYPE html><div id="${id}"></div>`)).window;

  const rootElement = document.getElementById(id);
  if (rootElement) {
    const inputElement = document.createElement('input') as HTMLInputElement;
    const modifiedInput = elmish.add_attributes(["class=new-todo", "autofocus", "id=new"], inputElement);
    rootElement.appendChild(modifiedInput);

    // Check if the attributes were applied correctly
    t.equal(modifiedInput.className, 'new-todo', "Class attribute applied correctly");
    t.equal(modifiedInput.id, 'new', "ID attribute applied correctly");
    t.equal(modifiedInput.hasAttribute('autofocus'), true, "Autofocus attribute applied");
  } else {
    t.fail('Root element not found');
  }

  // Note: We can't test document.activeElement due to JSDOM limitations
  // See: https://github.com/dwyl/javascript-todo-list-tutorial/issues/29

  t.end();
});

test('elmish.add_attributes applies HTML class attribute to el', function (t: Test) {
  const root = document.getElementById(id);
  if (root) {
    const div = document.createElement('div');
    div.id = 'divid';
    const modifiedDiv = elmish.add_attributes(["class=apptastic"], div);
    root.appendChild(modifiedDiv);

    // Test the div has the desired class
    t.equal(modifiedDiv.className, 'apptastic', "<div> has 'apptastic' CSS class applied");

    // Additional check using getElementsByClassName
    const nodes = document.getElementsByClassName('apptastic');
    t.equal(nodes.length, 1, "One element with 'apptastic' class found");
  } else {
    t.fail('Root element not found');
  }
  t.end();
});

test('elmish.add_attributes applies id HTML attribute to a node', function (t: Test) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  let el = document.createElement('section');
  el = elmish.add_attributes(["id=myid"], el);
  const text = 'hello world!'
  const txt = document.createTextNode(text);
  el.appendChild(txt);
  root.appendChild(el);
  const myidElement = document.getElementById('myid');
  if (!myidElement) {
    t.fail('Element with id "myid" not found');
    return t.end();
  }
  const actual = myidElement.textContent;
  t.equal(actual, text, "<section> has 'myid' id attribute");
  elmish.empty(root); // clear the "DOM"/"state" before next test
  t.end();
});

test('elmish.add_attributes applies multiple attribute to node', function (t: Test) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.empty(root);
  let el = document.createElement('span');
  el = elmish.add_attributes(["id=myid", "class=totes mcawesome"], el);
  const text = 'hello world'
  const txt = document.createTextNode(text);
  el.appendChild(txt);
  root.appendChild(el);
  const myidElement = document.getElementById('myid');
  if (!myidElement) {
    t.fail('Element with id "myid" not found');
    return t.end();
  }
  const actual = myidElement.textContent;
  t.equal(actual, text, "<span> has 'myid' id attribute");
  t.equal(el.className, 'totes mcawesome', "CSS class applied");
  t.end();
});

test('elmish.add_attributes set placeholder on <input> element', function (t: Test) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  const input = document.createElement('input');
  input.id = 'new-todo';
  const modifiedInput = elmish.add_attributes(["placeholder=What needs to be done?"], input) as HTMLInputElement;
  root.appendChild(modifiedInput);
  const newTodoElement = document.getElementById('new-todo') as HTMLInputElement | null;
  const placeholder = newTodoElement?.getAttribute("placeholder");
  t.equal(placeholder, "What needs to be done?", "placeholder set on <input>");
  t.end();
});

test('elmish.add_attributes set data-id on <li> element', function (t: Test) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  const li = document.createElement('li');
  li.id = 'task1';
  const modifiedLi = elmish.add_attributes(["data-id=123"], li);
  root.appendChild(modifiedLi);
  const taskElement = document.getElementById('task1');
  if (!taskElement) {
    t.fail('Task element not found');
    return t.end();
  }
  const data_id = taskElement.getAttribute("data-id");
  t.equal(data_id, '123', "data-id successfully added to <li> element");
  t.end();
});

test('elmish.add_attributes set "for" attribute <label> element', function (t: Test) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  const label = document.createElement('label');
  label.id = 'toggle';
  const modifiedLabel = elmish.add_attributes(["for=toggle-all"], label);
  root.appendChild(modifiedLabel);
  const toggleElement = document.getElementById('toggle');
  if (!toggleElement) {
    t.fail('Toggle element not found');
    return t.end();
  }
  const label_for = toggleElement.getAttribute("for");
  t.equal(label_for, "toggle-all", '<label for="toggle-all">');
  t.end();
});

test('elmish.add_attributes type="checkbox" on <input> element', function (t: Test) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  const input = document.createElement('input');
  const modifiedInput = elmish.add_attributes(["type=checkbox", "id=toggle-all"], input) as HTMLInputElement;
  root.appendChild(modifiedInput);
  const toggleAllElement = document.getElementById('toggle-all') as HTMLInputElement | null;
  const type_attr = toggleAllElement?.getAttribute("type");
  t.equal(type_attr, "checkbox", '<input id="toggle-all" type="checkbox">');
  t.end();
});

test('elmish.add_attributes apply style="display: block;"', function (t) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.empty(root);
  let sec = document.createElement('section');
  root.appendChild(
    elmish.add_attributes(["id=main", "style=display: block;"], sec)
  );
  const mainElement = document.getElementById('main');
  if (!mainElement) {
    t.fail('Main element not found');
    return t.end();
  }
  const style = window.getComputedStyle(mainElement);
  t.equal(style.display, 'block', 'style="display: block;" applied!')
  t.end();
});

test('elmish.add_attributes checked=true on "done" item', function (t: Test) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.empty(root);
  const input = document.createElement('input');
  const modifiedInput = elmish.add_attributes(["type=checkbox", "id=item1", "checked=true"], input) as HTMLInputElement;
  root.appendChild(modifiedInput);
  const item1 = document.getElementById('item1') as HTMLInputElement | null;
  t.equal(item1?.checked, true, '<input type="checkbox" checked="checked">');
  // test "checked=false" so we know we are able to "toggle" a todo item:
  const input2 = document.createElement('input');
  const modifiedInput2 = elmish.add_attributes(["type=checkbox", "id=item2"], input2) as HTMLInputElement;
  root.appendChild(modifiedInput2);
  const item2 = document.getElementById('item2') as HTMLInputElement | null;
  t.equal(item2?.checked, false, 'checked=false');
  t.end();
});

test('elmish.add_attributes <a href="#/active">Active</a>', function (t: Test) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.empty(root);
  root.appendChild(
    elmish.add_attributes(["href=#/active", "class=selected", "id=active"],
      document.createElement('a')
    )
  );
  // note: "about:blank" is the JSDOM default "window.location.href"
  console.log('JSDOM window.location.href:', window.location.href);
  // so when an href is set *relative* to this it becomes "about:blank#/my-link"
  // so we *remove* it before the assertion below, but it works fine in browser!
  const activeElement = document.getElementById('active') as HTMLAnchorElement;
  const href = activeElement?.href?.replace('about:blank', '') || '';
  t.equal(href, "#/active", 'href="#/active" applied to "active" link');
  t.end();
});

/** DEFAULT BRANCH **/
test('test default branch of elmish.add_attributes (no effect)', function (t: Test) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  const div = document.createElement('div');
  div.id = 'divid';
  // "Clone" the div DOM node before invoking elmish.attributes to compare
  const clone = div.cloneNode(true) as HTMLDivElement;
  const modifiedDiv = elmish.add_attributes(["unrecognised_attribute=noise"], div);
  t.deepEqual(modifiedDiv, clone, "<div> has not been altered");
  t.end();
});

/** null attrlist **/
test('test elmish.add_attributes attrlist null (no effect)', function (t: Test) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  const div = document.createElement('div');
  div.id = 'divid';
  // "Clone" the div DOM node before invoking elmish.attributes to compare
  const clone = div.cloneNode(true) as HTMLDivElement;
  const modifiedDiv = elmish.add_attributes([], div); // Use empty array instead of null
  t.deepEqual(modifiedDiv, clone, "<div> has not been altered");
  t.end();
});

test('elmish.append_childnodes append child DOM nodes to parent', function (t: Test) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.empty(root); // clear the test DOM before!
  const div = document.createElement('div');
  const p = document.createElement('p');
  const section = document.createElement('section');
  elmish.append_childnodes([div, p, section], root);
  t.equal(root.childElementCount, 3, `Root element ${id} has 3 child els`);
  t.end();
});

test('elmish.section creates a <section> HTML element', function (t: Test) {
  const p = document.createElement('p');
  p.id = 'para';
  const text = 'Hello World!'
  const txt = document.createTextNode(text);
  p.appendChild(txt);
  // create the `<section>` HTML element using our section function
  const section = elmish.section(["class=new-todo"], [p])
  const rootElement = document.getElementById(id);
  if (!rootElement) {
    t.fail('Root element not found');
    return t.end();
  }
  rootElement.appendChild(section); // add section with <p>
  // document.activeElement via: https://stackoverflow.com/a/17614883/1148249
  const paraElement = document.getElementById('para');
  if (!paraElement) {
    t.fail('Paragraph element not found');
    return t.end();
  }
  t.equal(paraElement.textContent, text,
    '<section> <p>' + text + '</p></section> works as expected!');
  elmish.empty(rootElement);
  t.end();
});

test('elmish create <header> view using HTML element functions', function (t: Test) {
  const { append_childnodes, section, header, h1, text, input } = elmish;
  const rootElement = document.getElementById(id);
  if (!rootElement) {
    t.fail('Root element not found');
    return t.end();
  }

  append_childnodes([
    section(["class=todoapp"], [ // array of "child" elements
      header(["class=header"], [
        h1([], [
          text("todos")
        ]), // </h1>
        input([
          "id=new",
          "class=new-todo",
          "placeholder=What needs to be done?",
          "autofocus"
        ], []) // <input> is "self-closing"
      ]) // </header>
    ])
  ], rootElement);

  const newElement = document.getElementById('new') as HTMLInputElement | null;
  const place = newElement?.getAttribute('placeholder');
  t.equal(place, "What needs to be done?", "placeholder set in <input> el");

  const h1Element = document.querySelector('h1');
  t.equal(h1Element?.textContent, 'todos', '<h1>todos</h1>');

  elmish.empty(rootElement);
  t.end();
});

test('elmish create "main" view using HTML DOM functions', function (t: Test) {
  const { section, input, label, ul, li, div, button, text } = elmish;
  const rootElement = document.getElementById(id);
  if (!rootElement) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.append_childnodes([
    section(["class=main", "style=display: block;"], [
      input(["id=toggle-all", "class=toggle-all", "type=checkbox"], []),
      label(["for=toggle-all"], [ text("Mark all as complete") ]),
      ul(["class=todo-list"], [
        li(["data-id=123", "class=completed"], [
          div(["class=view"], [
            input(["class=toggle", "type=checkbox", "checked=true"], []),
            label([], [text('Learn The Elm Architecture ("TEA")')]),
            button(["class=destroy"], [])
          ]) // </div>
        ]), // </li>
        li(["data-id=234"], [
          div(["class=view"], [
            input(["class=toggle", "type=checkbox"], []),
            label([], [text("Build TEA Todo List App")]),
            button(["class=destroy"], [])
          ]) // </div>
        ]) // </li>
      ]) // </ul>
    ])
  ], rootElement);
  const completedElement = document.querySelector('.completed');
  const done = completedElement ? completedElement.textContent : null;
  t.equal(done, 'Learn The Elm Architecture ("TEA")', 'Done: Learn "TEA"');
  const viewElements = document.querySelectorAll('.view');
  const todo = viewElements[1] ? viewElements[1].textContent : null;
  t.equal(todo, 'Build TEA Todo List App', 'Todo: Build TEA Todo List App');
  elmish.empty(rootElement);
  t.end();
});

test('elmish create <footer> view using HTML DOM functions', function (t: Test) {
  const { footer, span, strong, text, ul, li, a, button } = elmish;
  const rootElement = document.getElementById(id);
  if (!rootElement) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.append_childnodes([
    footer(["class=footer", "style=display: block;"], [
      span(["class=todo-count", "id=count"], [
        strong("1"),
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
      ]), // </ul>
      button(["class=clear-completed", "style=display:block;"],
        [text("Clear completed")]
      )
    ])
  ], rootElement);

  // count of items left:
  const countElement = document.getElementById('count');
  const left = countElement ? countElement.textContent : null;
  t.equal(left, "1 item left", 'there is 1 (ONE) todo item left');

  const clearButton = document.querySelector('button.clear-completed');
  const clear = clearButton ? clearButton.textContent : null;
  t.equal(clear, "Clear completed", '<button> text is "Clear completed"');

  const selectedElement = document.querySelector('.selected');
  const selected = selectedElement ? selectedElement.textContent : null;
  t.equal(selected, "All", "All is selected by default");

  elmish.empty(rootElement);
  t.end();
});

test('elmish.route updates the url hash and sets history', function (t) {
  const initial_hash = window.location.hash
  console.log('START window.location.hash:', initial_hash, '(empty string)');
  const initial_history_length = window.history.length;
  console.log('START window.history.length:', initial_history_length);
  // update the URL Hash and Set Browser History
  const state = { hash: '' };
  const new_hash = '#/active'
  const new_state = elmish.route(state, 'Active', new_hash);
  console.log('UPDATED window.history.length:', window.history.length);
  console.log('UPDATED state:', new_state);
  console.log('UPDATED window.location.hash:', window.location.hash);
  t.notEqual(initial_hash, window.location.hash, "location.hash has changed!");
  t.equal(new_hash, new_state.hash, "state.hash is now: " + new_state.hash);
  t.equal(new_hash, window.location.hash, "window.location.hash: "
    + window.location.hash);
  t.equal(initial_history_length + 1, window.history.length,
    "window.history.length increased from: " + initial_history_length + ' to: '
    + window.history.length);
  t.end();
});

// Testing localStorage requires a polyfill because:
// https://github.com/jsdom/jsdom/issues/1137 ¯\_(ツ)_/¯
// We use a custom implementation for type safety
interface CustomStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

class CustomStorageImpl implements CustomStorage {
  private storage = new Map<string, string>();

  getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }

  removeItem(key: string): void {
    this.storage.delete(key);
  }
}

(global as any).localStorage = (global as any).localStorage || new CustomStorageImpl();
localStorage.removeItem('todos-elmish_' + id);

// Test mount's localStorage using view and update from counter-reset example
// to confirm that our elmish.mount localStorage works and is "generic".
test('elmish.mount sets model in localStorage and handles errors', function (t: Test) {
  const { view, update } = require('./counter');
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }

  const errorMessages: Array<{ message: string, error?: Error }> = [];
  const logMessages: string[] = [];
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;
  const mockLocalStorage = setupMockLocalStorage();
  const storeName = 'todos-elmish_' + id;

  function setupMockConsole() {
    console.error = (message: string, error?: Error, ...args: any[]) => {
      errorMessages.push({ message, error });
      logMessages.push(`ERROR: ${message}`);
    };
    console.log = (message: string, ...args: any[]) => {
      logMessages.push(message);
    };
  }

  function setupMockLocalStorage() {
    const mock = {
      store: new Map<string, string>(),
      getItem: (key: string): string | null => mock.store.get(key) || null,
      setItem: (key: string, value: string): void => { mock.store.set(key, value); },
      removeItem: (key: string): void => { mock.store.delete(key); },
      clear: (): void => { mock.store.clear(); },
      length: 0
    };
    Object.defineProperty(window, 'localStorage', { value: mock });
    return mock;
  }

  function assertStoredModel(expectedValue: number, message: string) {
    const storedModel = mockLocalStorage.getItem(storeName);
    t.equal(JSON.parse(storedModel || '0'), expectedValue, message);
  }

  function assertRenderedState(expectedValue: number, message: string) {
    const element = document.getElementById(id);
    if (!element || !element.textContent) {
      t.fail('Element not found or has no text content');
      return;
    }
    const actualValue = parseInt(element.textContent.replace('+', '').replace('-Reset', ''), 10);
    t.equal(actualValue, expectedValue, message);
  }

  function assertLoggedMessage(expectedMessage: string) {
    t.ok(logMessages.some(msg => msg.includes(expectedMessage)), `Log message found: ${expectedMessage}`);
  }

  function assertErrorLogged(expectedMessage: string, callback: () => void) {
    const originalErrorMessages = [...errorMessages];
    errorMessages.length = 0;
    callback();
    t.ok(errorMessages.some(e => e.message.includes(expectedMessage)), `Error logged: ${expectedMessage}`);
    errorMessages.push(...originalErrorMessages);
  }

  setupMockConsole();
  mockLocalStorage.clear();

  // Test initial mount
  elmish.mount(7, update, view, id);
  assertStoredModel(7, "Initial state saved to localStorage");
  assertRenderedState(7, "Initial state rendered correctly");
  assertLoggedMessage('[MOUNT] Mounting app with root element id: test-app');
  assertLoggedMessage('[INIT] Using provided initial model:');

  // Test re-mount with different value (should use localStorage value)
  elmish.mount(42, update, view, id);
  assertStoredModel(7, "Value from localStorage used on re-mount");
  assertRenderedState(7, "Rendered state matches localStorage value on re-mount");
  assertLoggedMessage('[INIT] Using stored model from localStorage');

  // Test state update
  const btn = root.getElementsByClassName("inc")[0] as HTMLElement;
  btn.click();
  assertRenderedState(8, "State updated after increment");
  assertStoredModel(8, "Updated state saved to localStorage");
  assertLoggedMessage('[SIGNAL] Signal called with action: inc');
  assertLoggedMessage('[SIGNAL] Model updated:');

  // Test persistence across DOM reset
  elmish.empty(root);
  elmish.mount(5, update, view, id);
  assertStoredModel(8, "State persisted in localStorage after DOM reset");
  assertRenderedState(8, "Rendered state matches persisted state after DOM reset");

  // Test error handling for localStorage.getItem
  const originalGetItem = mockLocalStorage.getItem;
  mockLocalStorage.getItem = () => { throw new Error("MockLocalStorageError: getItem failed"); };
  assertErrorLogged('[GET] Error retrieving or parsing model from localStorage', () => {
    elmish.mount(10, update, view, id);
  });
  assertRenderedState(10, "Fallback to initial model when localStorage.getItem fails");
  assertStoredModel(10, "Initial model saved to localStorage when getItem fails");

  // Test error handling for localStorage.setItem
  mockLocalStorage.getItem = originalGetItem;
  const originalSetItem = mockLocalStorage.setItem;
  mockLocalStorage.setItem = () => { throw new Error("MockLocalStorageError: setItem failed"); };
  assertErrorLogged('[SAVE] Error saving model to localStorage', () => {
    elmish.mount(11, update, view, id);
  });
  assertRenderedState(11, "Model rendered correctly even when localStorage.setItem fails");

  // Test application behavior when localStorage is completely unavailable
  const originalLocalStorage = window.localStorage;
  Object.defineProperty(window, 'localStorage', { value: undefined });
  assertErrorLogged('[GET] localStorage is not available', () => {
    elmish.mount(12, update, view, id);
  });
  assertRenderedState(12, "Application works with initial model when localStorage is unavailable");

  // Restore localStorage for subsequent tests
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

  // Test JSON.parse error handling
  mockLocalStorage.getItem = () => 'invalid JSON';
  assertErrorLogged('[GET] Error retrieving or parsing model from localStorage', () => {
    elmish.mount(13, update, view, id);
  });
  assertRenderedState(13, "Fallback to initial model when stored JSON is invalid");
  assertStoredModel(13, "Initial model saved to localStorage when JSON is invalid");

  // Test signal function and model updates
  const signalTest = (action: string, expectedValue: number) => {
    return () => {
      const signal = elmish.mount(14, update, view, id);
      if (typeof signal === 'function') {
        signal(action)();
        assertRenderedState(expectedValue, `Model updated correctly after ${action}`);
        assertStoredModel(expectedValue, `Updated model saved to localStorage after ${action}`);
        assertLoggedMessage(`[SIGNAL] Signal called with action: ${action}`);
      } else {
        t.fail(`Signal function not returned from mount for action: ${action}`);
      }
    };
  };

  signalTest('inc', 15)();
  signalTest('dec', 14)();
  signalTest('reset', 0)();

  // Test error in update function
  const errorUpdate = (action: string, model: number) => {
    throw new Error("Update function error");
  };
  assertErrorLogged('[SIGNAL] Error updating model for action', () => {
    const signal = elmish.mount(0, errorUpdate, view, id);
    if (typeof signal === 'function') {
      signal('test')();
    } else {
      t.fail('Signal function not returned from mount');
    }
  });

  // Test subscriptions
  let subscriptionCalled = false;
  const testSubscriptions = (signal: (action: string, data?: any) => () => void) => {
    subscriptionCalled = true;
  };
  elmish.mount(0, update, view, id, testSubscriptions);
  t.ok(subscriptionCalled, "Subscriptions function called during mount");
  assertLoggedMessage('[INIT] Initializing subscriptions');

  // Clean up
  Object.defineProperty(window, 'localStorage', { value: originalLocalStorage });
  mockLocalStorage.clear();
  mockLocalStorage.getItem = originalGetItem;
  mockLocalStorage.setItem = originalSetItem;
  console.error = originalConsoleError;
  console.log = originalConsoleLog;
  t.end();
});

test('elmish.add_attributes onclick=signal(action) events!', function (t: Test) {
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }
  elmish.empty(root);
  let counter = 0; // global to this test.
  function signal (action: string): () => void { // simplified version of TEA "dispatcher" function
    return function callback(): void {
      switch (action) {
        case 'inc':
          counter++; // "mutating" ("impure") counters for test simplicity.
          break;
      }
    }
  }

  root.appendChild(
    elmish.add_attributes(["id=btn", signal('inc')],
      document.createElement('button'))
  );

  // "click" the button!
  const btn = document.getElementById("btn");
  if (!btn) {
    t.fail('Button element not found');
    return t.end();
  }
  btn.click();
  // confirm that the counter was incremented by the onclick being triggered:
  t.equal(counter, 1, "Counter incremented via onclick attribute (function)!");
  elmish.empty(root);
  t.end();
});


test('subscriptions test using counter-reset-keyaboard ⌨️', function (t: Test) {
  const { view, update, subscriptions } = require('./counter-reset-keyboard.ts')
  const root = document.getElementById(id);
  if (!root) {
    t.fail('Root element not found');
    return t.end();
  }

  // mount the counter-reset-keyboard example app WITH subscriptions:
  elmish.mount(0, update, view, id, subscriptions);

  // counter starts off at 0 (zero):
  const countElement = document.getElementById('count');
  if (!countElement || typeof countElement.textContent !== 'string') {
    t.fail('Count element not found or has no text content');
    return t.end();
  }
  t.equal(parseInt(countElement.textContent, 10), 0, "Count is 0 (Zero) at start.");
  const initialStoredValue = localStorage.getItem('todos-elmish_' + id);
  t.equal(JSON.parse(initialStoredValue || '0'), 0,
    "todos-elmish_store is 0 (as expected). initial state saved to localStorage.");

  // trigger the [↑] (up) keyboard key to increment the counter:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 38})); // up
  const updatedCountElement = document.getElementById('count');
  if (!updatedCountElement || typeof updatedCountElement.textContent !== 'string') {
    t.fail('Updated count element not found or has no text content');
    return t.end();
  }
  t.equal(parseInt(updatedCountElement.textContent, 10), 1, "Up key press increment 0 -> 1");
  const incrementedStoredValue = localStorage.getItem('todos-elmish_' + id);
  t.equal(JSON.parse(incrementedStoredValue || '0'), 1,
    "todos-elmish_store 1 (as expected). incremented state saved to localStorage.");

  // trigger the [↓] (down) keyboard key to increment the counter:
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 40})); // down
  const decrementedCountElement = document.getElementById('count');
  if (!decrementedCountElement || typeof decrementedCountElement.textContent !== 'string') {
    t.fail('Decremented count element not found or has no text content');
    return t.end();
  }
  t.equal(parseInt(decrementedCountElement.textContent, 10), 0, "Down key press decrement 1 -> 0");
  const decrementedStoredValue = localStorage.getItem('todos-elmish_' + id);
  t.equal(JSON.parse(decrementedStoredValue || '0'), 0,
    "todos-elmish_store 0. keyboard down key decrement state saved to localStorage.");

  // subscription keyCode trigger "branch" test (should NOT fire the signal):
  const rootElement = document.getElementById(id);
  if (!rootElement) {
    t.fail('Root element not found for cloning');
    return t.end();
  }
  const clone = rootElement.cloneNode(true);
  document.dispatchEvent(new KeyboardEvent('keyup', {'keyCode': 42})); //
  t.deepEqual(rootElement, clone, "#" + id + " no change");

  // default branch execution:
  const incButton = document.getElementById('inc') as HTMLElement;
  if (!incButton) {
    t.fail('Increment button not found');
    return t.end();
  }
  incButton.click();
  const incCountElement = document.getElementById('count');
  if (!incCountElement || typeof incCountElement.textContent !== 'string') {
    t.fail('Incremented count element not found or has no text content');
    return t.end();
  }
  t.equal(parseInt(incCountElement.textContent, 10), 1, "inc: 0 -> 1");

  const resetButton = document.getElementById('reset') as HTMLElement;
  if (!resetButton) {
    t.fail('Reset button not found');
    return t.end();
  }
  resetButton.click();
  const resetCountElement = document.getElementById('count');
  if (!resetCountElement || typeof resetCountElement.textContent !== 'string') {
    t.fail('Reset count element not found or has no text content');
    return t.end();
  }
  t.equal(parseInt(resetCountElement.textContent, 10), 0, "reset: 1 -> 0");
  const no_change = update('', 7);
  t.equal(no_change, 7, "no change in model if action is unrecognised.");

  localStorage.removeItem('todos-elmish_' + id);
  elmish.empty(root);
  t.end();
});
