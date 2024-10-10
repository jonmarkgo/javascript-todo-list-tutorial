import { JSDOM } from 'jsdom';

console.log('Setting up JSDOM environment...');

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
  url: 'http://localhost',
  runScripts: 'dangerously',
});

const { window } = dom;

console.log('Mocking global objects...');

Object.assign(global, {
  window,
  document: window.document,
  navigator: window.navigator,
  HTMLElement: window.HTMLElement,
  Element: window.Element,
  Node: window.Node,
  NodeList: window.NodeList,
  Event: window.Event,
  MouseEvent: window.MouseEvent,
  KeyboardEvent: window.KeyboardEvent,
  localStorage: {
    _stores: {} as { [key: string]: { [key: string]: string } },
    _currentStore: 'default',
    setCurrentStore: function(storeName: string): void {
      this._currentStore = storeName;
      if (!this._stores[storeName]) {
        this._stores[storeName] = {};
      }
      console.log(`Setting current store to: ${storeName}`);
    },
    getItem: function(key: string): string | null {
      console.log(`[${this._currentStore}] getItem: ${key}`);
      console.log(`Current store state:`, this._stores[this._currentStore]);
      return this._stores[this._currentStore][key] || null;
    },
    setItem: function(key: string, value: string): void {
      if (!this._stores[this._currentStore]) {
        this._stores[this._currentStore] = {};
      }
      console.log(`[${this._currentStore}] setItem: ${key}, ${value}`);
      this._stores[this._currentStore][key] = value.toString();
      console.log(`Updated store state:`, this._stores[this._currentStore]);
    },
    removeItem: function(key: string): void {
      console.log(`[${this._currentStore}] removeItem: ${key}`);
      delete this._stores[this._currentStore][key];
      console.log(`Updated store state:`, this._stores[this._currentStore]);
    },
    clear: function(): void {
      console.log(`[${this._currentStore}] clear`);
      this._stores[this._currentStore] = {};
      console.log(`Cleared store state:`, this._stores[this._currentStore]);
    }
  },
});

// Initialize the default store
localStorage.setCurrentStore('default');

// Set initial model for tests
const initialModel = 0;
localStorage.setItem('todos-elmish_app', JSON.stringify(initialModel));

console.log('Checking if localStorage is properly mocked...');
console.log('localStorage.setItem("test", "value")');
localStorage.setItem('test', 'value');
console.log('localStorage.getItem("test"):', localStorage.getItem('test'));

// Ensure the 'app' element is available
if (!document.getElementById('app')) {
  const appElement = document.createElement('div');
  appElement.id = 'app';
  document.body.appendChild(appElement);
}

console.log('JSDOM setup complete');
console.log('App element exists:', document.getElementById('app') !== null);
console.log('App element innerHTML:', document.getElementById('app')?.innerHTML);

export {};
