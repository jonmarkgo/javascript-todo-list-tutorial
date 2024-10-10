import { JSDOM } from 'jsdom';
import jsdomGlobal from 'jsdom-global';

const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>', {
  url: 'http://localhost',
  runScripts: 'dangerously',
});

console.log('JSDOM created');

(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).navigator = dom.window.navigator;
(global as any).HTMLElement = dom.window.HTMLElement;
(global as any).Element = dom.window.Element;

console.log('Global objects set');

// Ensure the 'app' element is available
if (!document.getElementById('app')) {
  console.log('App element not found, creating it');
  const appElement = document.createElement('div');
  appElement.id = 'app';
  document.body.appendChild(appElement);
} else {
  console.log('App element already exists');
}

// Verify the 'app' element creation
console.log('App element exists:', document.getElementById('app') !== null);
console.log('App element innerHTML:', document.getElementById('app')?.innerHTML);

// Add any other global variables that your tests might need

console.log('Setup complete');

jsdomGlobal();

export {};
