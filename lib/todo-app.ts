// todo-app.ts

export interface Todo {
  id: number;
  title: string;
  done: boolean;
}

export interface Model {
  todos: Todo[];
  hash: string;
}

export type Signal = (action: any) => void;

export const model: Model = {
  todos: [],
  hash: ''
};

export function update(action: string, model: Model, data?: any): Model {
  console.log('Update function called with action:', action, 'and model:', model);
  switch (action) {
    case 'ADD':
      if (typeof data === 'string') {
        const newTodo: Todo = { id: model.todos.length + 1, title: data, done: false };
        const updatedModel = { ...model, todos: [...model.todos, newTodo] };
        console.log('Updated model after ADD:', updatedModel);
        return updatedModel;
      }
      return model;
    case 'TOGGLE':
      if (typeof data === 'number') {
        const updatedModel = {
          ...model,
          todos: model.todos.map(todo =>
            todo.id === data ? { ...todo, done: !todo.done } : todo
          )
        };
        console.log('Updated model after TOGGLE:', updatedModel);
        return updatedModel;
      }
      return model;
    default:
      console.log('No action matched, returning original model');
      return model;
  }
}

export function render_item(todo: Todo, model: Model, signal: Signal): HTMLLIElement {
  const li = document.createElement('li');
  li.textContent = todo.title;
  return li;
}

export function render_main(model: Model, signal: Signal): HTMLElement {
  console.log('Rendering main, model:', JSON.stringify(model, null, 2));
  console.log('Model type:', typeof model);
  console.log('Model keys:', Object.keys(model));
  console.log('Todos type:', typeof model.todos);
  console.log('Is todos an array?', Array.isArray(model.todos));
  const main = document.createElement('main');

  // Ensure model is an object and todos is an array
  if (model && typeof model === 'object' && 'todos' in model) {
    console.log('Model is an object');
    const todos = Array.isArray(model.todos) ? model.todos : [];
    console.log('Todos array length:', todos.length);
    console.log('Todos array content:', JSON.stringify(todos, null, 2));

    if (todos.length > 0) {
      todos.forEach((todo, index) => {
        console.log(`Todo at index ${index}:`, JSON.stringify(todo, null, 2));
        if (todo && typeof todo === 'object' && 'id' in todo && 'title' in todo && 'done' in todo) {
          console.log('Rendering todo:', JSON.stringify(todo, null, 2));
          const todoElement = render_item(todo, model, signal);
          console.log('Rendered todo element:', todoElement.outerHTML);
          main.appendChild(todoElement);
        } else {
          console.error('Invalid todo item:', JSON.stringify(todo, null, 2));
        }
      });
    } else {
      console.log('Todos array is empty');
      const emptyMessage = document.createElement('p');
      emptyMessage.textContent = 'No todos yet. Add a new one!';
      main.appendChild(emptyMessage);
    }
  } else {
    console.error('Invalid model structure:', JSON.stringify(model, null, 2));
    const errorMessage = document.createElement('p');
    errorMessage.textContent = 'Error: Unable to load todos.';
    main.appendChild(errorMessage);
  }

  console.log('Final main element:', main.outerHTML);
  return main;
}

export function render_footer(model: Model): HTMLElement {
  const footer = document.createElement('footer');
  footer.textContent = `${model.todos.length} items left`;
  return footer;
}

// Add other functions as needed

export function view(model: Model, signal: Signal): HTMLElement {
  const container = document.createElement('div');
  container.appendChild(render_main(model, signal));
  container.appendChild(render_footer(model));
  return container;
}

export function subscriptions(signal: Signal): void {
  // Implement any necessary subscriptions
}
