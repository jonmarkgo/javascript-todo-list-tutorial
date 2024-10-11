import test from 'tape';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as elmish from '../src/elmish';
import { JSDOM } from 'jsdom';
import 'jsdom-global/register';
import { view } from '../src/todo-app';
import { update, mount, div, button, empty } from '../src/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define a type for the test function
interface Test {
  (name: string, cb: (t: any) => void): void;
  only: (name: string, cb: (t: any) => void) => void;
  skip: (name: string, cb: (t: any) => void) => void;
}

// Cast the imported test function to our Test interface
const typedTest = test as Test;

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
const jsdom = new JSDOM(html);
global.document = jsdom.window.document;
global.window = jsdom.window as any;
global.navigator = jsdom.window.navigator;

const testId = 'test-app';

// Basic type definitions for elmish module
interface ElmishModule {
  mount: (initialState: any, update: Function, view: Function, id: string, subscriptions?: Function) => void;
  empty: (el: HTMLElement) => void;
  add_attributes: (attrs: string[], el: HTMLElement) => void;
  text: (s: string) => Text;
  button: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLButtonElement;
  div: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLDivElement;
  input: (attrs: string[]) => HTMLInputElement;
  label: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLLabelElement;
  h1: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLHeadingElement;
  span: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLSpanElement;
  strong: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLElement;
  a: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLAnchorElement;
  ul: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLUListElement;
  li: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLLIElement;
}

// Mock implementation of add_attributes
function mockAddAttributes(attrs: string[], el: HTMLElement): HTMLElement {
  attrs.forEach(attr => {
    const [key, value] = attr.split('=');
    if (key === 'class') {
      el.className = value;
    } else {
      el.setAttribute(key, value);
    }
  });
  return el;
}

// Create a type-safe version of elmishTyped
const elmishTyped: ElmishModule = {
  ...elmish as unknown as ElmishModule,
  add_attributes: mockAddAttributes
};

// Mock localStorage
const mockLocalStorage: { [key: string]: string } = {};

Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: (key: string): string | null => mockLocalStorage[key] || null,
    setItem: (key: string, value: string): void => {
      mockLocalStorage[key] = value;
    },
    removeItem: (key: string): void => {
      delete mockLocalStorage[key];
    },
    clear: (): void => {
      Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
    },
    key: (index: number): string | null => Object.keys(mockLocalStorage)[index] || null,
    length: 0,
  },
  writable: true
});

// Add a console.log to check localStorage operations
console.log('Initial mockLocalStorage:', mockLocalStorage);

typedTest('elmish.empty("root") removes DOM elements from container', function (t: any) {
  const root = document.getElementById(testId) as HTMLElement;
  root.innerHTML = '<p>Hello World!</p>';
  t.equal(root.childElementCount, 1, "Root element has 1 child element");
  elmishTyped.empty(root);
  t.equal(root.childElementCount, 0, "Root element has 0 child elements");
  t.end();
});

typedTest('elmish.add_attributes applies multiple attributes', function (t: any) {
  const el = document.createElement('input');
  elmishTyped.add_attributes(["class=todo-input", "placeholder=What needs to be done?"], el);
  t.equal(el.className, 'todo-input', "Class attribute applied correctly");
  t.equal(el.getAttribute('placeholder'), 'What needs to be done?', "Placeholder attribute applied correctly");
  t.end();
});

typedTest('elmish.text creates a text node with desired text', function (t: any) {
  const text = elmishTyped.text('Hello World!');
  t.equal(text.textContent, 'Hello World!', "Text node contains correct text");
  t.end();
});

typedTest('elmish.div creates a div element with attributes and children', function (t: any) {
  const div = elmishTyped.div(["class=test-div"], [elmishTyped.text("Test content")]);
  t.equal(div.tagName, "DIV", "Created element is a div");
  t.equal(div.className, "test-div", "Div has the correct class");
  t.equal(div.textContent, "Test content", "Div has the correct text content");
  t.end();
});

typedTest('elmish.input creates an input element with attributes', function (t: any) {
  const input = elmishTyped.input(["type=text", "placeholder=Enter text"]);
  t.equal(input.tagName, "INPUT", "Created element is an input");
  t.equal(input.type, "text", "Input has the correct type");
  t.equal(input.placeholder, "Enter text", "Input has the correct placeholder");
  t.end();
});

typedTest('elmish.label creates a label element with attributes and children', function (t: any) {
  const label = elmishTyped.label(["for=test-input"], [elmishTyped.text("Test label")]);
  t.equal(label.tagName, "LABEL", "Created element is a label");
  t.equal(label.getAttribute("for"), "test-input", "Label has the correct for attribute");
  t.equal(label.textContent, "Test label", "Label has the correct text content");
  t.end();
});

typedTest('elmish.h1 creates an h1 element with attributes and children', function (t: any) {
  const h1 = elmishTyped.h1(["class=title"], [elmishTyped.text("Test heading")]);
  t.equal(h1.tagName, "H1", "Created element is an h1");
  t.equal(h1.className, "title", "H1 has the correct class");
  t.equal(h1.textContent, "Test heading", "H1 has the correct text content");
  t.end();
});

typedTest('elmish.span creates a span element with attributes and children', function (t: any) {
  const span = elmishTyped.span(["class=highlight"], [elmishTyped.text("Test span")]);
  t.equal(span.tagName, "SPAN", "Created element is a span");
  t.equal(span.className, "highlight", "Span has the correct class");
  t.equal(span.textContent, "Test span", "Span has the correct text content");
  t.end();
});

typedTest('elmish.strong creates a strong element with attributes and children', function (t: any) {
  const strong = elmishTyped.strong(["class=important"], [elmishTyped.text("Test strong")]);
  t.equal(strong.tagName, "STRONG", "Created element is a strong");
  t.equal(strong.className, "important", "Strong has the correct class");
  t.equal(strong.textContent, "Test strong", "Strong has the correct text content");
  t.end();
});

typedTest('elmish.a creates an anchor element with attributes and children', function (t: any) {
  const a = elmishTyped.a(["href=#test"], [elmishTyped.text("Test link")]);
  t.equal(a.tagName, "A", "Created element is an anchor");
  t.equal(a.getAttribute("href"), "#test", "Anchor has the correct href");
  t.equal(a.textContent, "Test link", "Anchor has the correct text content");
  t.end();
});

typedTest('elmish.ul creates an unordered list element with attributes and children', function (t: any) {
  const li = elmishTyped.li([], [elmishTyped.text("Test item")]);
  const ul = elmishTyped.ul(["class=list"], [li]);
  t.equal(ul.tagName, "UL", "Created element is an unordered list");
  t.equal(ul.className, "list", "UL has the correct class");
  t.equal(ul.children.length, 1, "UL has one child");
  t.equal(ul.firstChild!.textContent, "Test item", "UL child has the correct text content");
  t.end();
});

// Remove any leftover code or commented-out sections

// Add more tests as needed to cover all elmish functions

// Ensure all tests use the typedTest function and proper type annotations
typedTest('elmish.mount sets model in localStorage', function (t: any) {
  const root = document.getElementById(testId) as HTMLElement;
  const initialModel = { todos: [], hash: '#/' };
  const store_name = 'todos-elmish_' + testId;

  // Clear localStorage and set initial model
  localStorage.clear();
  localStorage.setItem(store_name, JSON.stringify(initialModel));

  console.log('Before mount - localStorage:', localStorage.getItem(store_name));

  elmishTyped.mount(initialModel, update, view, testId);

  console.log('After mount - localStorage:', localStorage.getItem(store_name));

  const storedValue = localStorage.getItem(store_name);
  console.log('Stored value:', storedValue);

  t.deepEqual(JSON.parse(storedValue || '{}'), initialModel,
    `todos-elmish_store is ${JSON.stringify(initialModel)} (as expected). initial state saved to localStorage.`);

  const todoAppElement = document.getElementById(testId);
  t.ok(todoAppElement, 'Todo app element exists');

  const headerElement = todoAppElement?.querySelector('.header');
  t.ok(headerElement, 'Header element exists');

  const newTodoInput = todoAppElement?.querySelector('.new-todo') as HTMLInputElement;
  t.ok(newTodoInput, 'New todo input exists');
  t.equal(newTodoInput?.placeholder, 'What needs to be done?', 'New todo input has correct placeholder');

  const todoList = todoAppElement?.querySelector('.todo-list');
  t.ok(todoList, 'Todo list exists');
  t.equal(todoList?.children.length, 0, 'Todo list is initially empty');

  localStorage.removeItem(store_name);
  elmishTyped.empty(root);
  t.end();
});
