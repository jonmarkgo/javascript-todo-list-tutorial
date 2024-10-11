import { view } from './todo-app';
import { mount } from './elmish';

const mockModel = {
  todos: [
    { id: 1, title: "Test Todo 1", done: false },
    { id: 2, title: "Test Todo 2", done: true }
  ],
  hash: "#/"
};

function mockSignal() {
  return () => {};
}

const debugElement = document.createElement('div');
debugElement.id = 'debug-app';
document.body.appendChild(debugElement);

console.log('Initial mock model:', JSON.stringify(mockModel, null, 2));

const renderedView = view(mockModel, mockSignal);
console.log('Rendered view structure:', renderedView.outerHTML);

mount(mockModel, (action: string, model: any) => model, view, 'debug-app', () => {});

console.log('Mounted view structure:', debugElement.innerHTML);

const todoItems = debugElement.querySelectorAll('.todo-list li');
console.log('Number of rendered todo items:', todoItems.length);
todoItems.forEach((item, index) => {
  console.log(`Todo item ${index + 1}:`, item.outerHTML);
});
