// @ts-ignore
import jsdomGlobal from 'jsdom-global';
// @ts-ignore
import * as jsdom from 'jsdom';
import * as elmishModule from '../lib/elmish';
import test from 'tape';

const html = '<!DOCTYPE html><div id="test-app"></div>';
jsdomGlobal(html);
const { JSDOM } = jsdom;

const id = 'test-app';

// Type definitions for elmish functions
interface ElmishModule {
  section: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLElement;
  header: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLElement;
  h1: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLElement;
  input: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLElement;
  text: (content: string) => Text;
  ul: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLElement;
  li: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLElement;
  div: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLElement;
  label: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLElement;
  button: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLElement;
  footer: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLElement;
  span: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLElement;
  a: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLElement;
  strong: (attrs: string[], children: (HTMLElement | Text)[]) => HTMLElement;
  route: (state: any, action: string, hash: string) => { hash: string };
  mount: (model: any, update: (model: any, action: any) => any, view: (model: any) => HTMLElement, id: string) => void;
  empty: (element: HTMLElement) => void;
  add_attributes: (attrs: string[], el: HTMLElement) => HTMLElement;
  append_childnodes: (nodes: (HTMLElement | Text)[], parent: HTMLElement) => void;
  create_element: (tag: string, attrs: string[]) => HTMLElement;
}

// Use type assertion with 'unknown' as an intermediate step
const elmish = (elmishModule as unknown) as ElmishModule;

test('elmish.route updates window.location.hash', function (t) {
  const initial_hash = window.location.hash;
  console.log('START window.location.hash:', initial_hash, '(empty string)');
  const initial_history_length = window.history.length;
  console.log('START window.history.length:', initial_history_length);
  // update the URL Hash and Set Browser History
  const state = { hash: '' };
  const new_hash = '#/active';
  const new_state = elmish.route(state, 'Active', new_hash);
  console.log('UPDATED window.history.length:', window.history.length);
  console.log('UPDATED state:', new_state);
  console.log('UPDATED window.location.hash:', window.location.hash);
  t.notEqual(initial_hash, window.location.hash, "location.hash has changed!");
  t.equal(new_hash, new_state.hash, "state.hash is now: " + new_state.hash);
  t.equal(new_hash, window.location.hash, "window.location.hash: " + window.location.hash);
  t.equal(initial_history_length + 1, window.history.length,
    "window.history.length increased from: " + initial_history_length + ' to: ' + window.history.length);
  t.end();
});

// Mock localStorage
const mockLocalStorage: Storage = {
  getItem: function(key: string) {
    const value = this[key as keyof typeof this];
    return typeof value === 'undefined' ? null : value as string | null;
  },
  setItem: function(key: string, value: string) {
    this[key as keyof typeof this] = value;
  },
  removeItem: function(key: string) {
    delete this[key as keyof typeof this];
  },
  clear: function() {
    Object.keys(this).forEach(key => delete this[key as keyof typeof this]);
  },
  key: function(index: number) {
    return Object.keys(this)[index] || null;
  },
  length: 0
};

Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

test('elmish.mount saves initial state to localStorage', function (t) {
  const { view, update } = require('./counter.js');
  const root = document.getElementById(id) as HTMLElement;

  elmish.mount(7, update, view, id);
  const storedValue = localStorage.getItem('todos-elmish_' + id);
  t.equal(JSON.parse(storedValue || '0'), 7, "todos-elmish_store is 7 (as expected).");

  // Test that mount still works as expected (check initial state of counter)
  const actual = document.getElementById(id)?.textContent;
  const actual_stripped = parseInt(actual?.replace('+', '').replace('-Reset', '') || '0', 10);
  t.equal(actual_stripped, 7, "Initial state set to 7.");

  // Attempt to re-mount with a different model value
  elmish.mount(42, update, view, id);
  t.equal(JSON.parse(localStorage.getItem('todos-elmish_' + id) || '0'), 7,
    "todos-elmish_store is still 7 (as expected). Initial state preserved in localStorage.");

  // Clean up
  localStorage.removeItem('todos-elmish_' + id);
  elmish.empty(root);
  t.end();
});

// ... (remaining necessary tests with type assertions and error fixes)
