console.log('Executing elmish.test.ts');
import test from 'tape';
import fs from 'fs';
import path from 'path';
import * as elmish from '../lib/elmish';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jsdomGlobal from 'jsdom-global';
import jsdom from 'jsdom';

const { empty, mount, section, div, input, span, li, label, a, header, h1 } = elmish;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf-8');
jsdomGlobal(html);

const { JSDOM } = jsdom;
const id = 'test-app';

// Helper function to create a text node wrapped in a span
const createTextElement = (text: string): HTMLElement => {
  const span = document.createElement('span');
  span.appendChild(document.createTextNode(text));
  return span;
};

test('elmish functions add href and class attributes to <a> element', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  empty(root);
  const newAnchor = a(["href=#/active", "class=selected", "id=active"], []);
  root.appendChild(newAnchor);
  const href = document.getElementById('active')?.getAttribute("href");
  const cls = document.getElementById('active')?.getAttribute("class");
  t.equal(href, "#/active", '<a href="#/active">');
  t.equal(cls, "selected", '<a class="selected">');
  t.end();
});

test('elmish functions ignore unrecognised attributes', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  const newDiv = div(["id=divid", "unrecognised_attribute=noise"], []);
  root.appendChild(newDiv);
  const unrecognised = document.getElementById('divid')?.getAttribute("unrecognised_attribute");
  t.equal(unrecognised, null, "unrecognised attribute not added");
  t.end();
});

test('elmish functions append child DOM nodes to parent', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  empty(root);
  const childDiv = div([], []);
  const childP = document.createElement('p');
  const childSection = section([], []);
  root.appendChild(childDiv);
  root.appendChild(childP);
  root.appendChild(childSection);
  t.equal(root.childElementCount, 3, "Root element " + id + " has 3 child els");
  t.end();
});

test('elmish create <header> view using HTML element functions', function (t) {
  const root = document.getElementById(id) as HTMLElement;
  empty(root);

  const headerElement = header(["class=header"], [
    h1([], [createTextElement("todos")]),
    input([
      "id=new",
      "class=new-todo",
      "placeholder=What needs to be done?",
      "autofocus"
    ], [])
  ]);

  const sectionElement = section(["class=todoapp"], [headerElement]);

  root.appendChild(sectionElement);

  const place = document.getElementById('new')?.getAttribute('placeholder');
  t.equal(place, "What needs to be done?", "placeholder set in <input> el");

  const h1Text = document.querySelector('h1')?.textContent;
  t.equal(h1Text, "todos", "<h1>todos</h1> text set correctly");

  t.end();
});

// Add more tests here as needed
