// Import necessary functions from elmish.ts
import { mount, text, button, div } from '../lib/elmish.js';

// Define types
type Model = number;
type Action = 'inc' | 'dec' | 'reset' | null;

// Update function
function update(action: Action | string, model: Model): Model {
  switch(action) {
    case 'inc': return model + 1;
    case 'dec': return model - 1;
    case 'reset': return 0;
    default: return model;
  }
}

// Helper function to wrap Text nodes in a span element
function wrapTextNode(node: Text | HTMLElement): HTMLElement {
  return node instanceof Text ? document.createElement('span').appendChild(node).parentElement! : node;
}

// View function
function view(model: Model, signal: (action: string) => () => void): HTMLElement {
  return div(['class=counter-reset-keyboard'], [
    button(['onclick=' + signal('dec')], [wrapTextNode(text('-'))]),
    div([], [wrapTextNode(text(model.toString()))]),
    button(['onclick=' + signal('inc')], [wrapTextNode(text('+'))]),
    button(['onclick=' + signal('reset')], [wrapTextNode(text('Reset'))])
  ]);
}

// Subscriptions function
function subscriptions(signal: (action: string) => void): void {
  document.onkeydown = function(e: KeyboardEvent) {
    switch(e.key) {
      case 'ArrowUp':
        signal('inc');
        break;
      case 'ArrowDown':
        signal('dec');
        break;
      case 'r':
      case 'R':
        signal('reset');
        break;
    }
  };
}

// Export the functions
export { view, update, subscriptions };

// Mount function (for testing purposes)
export function init(id: string): void {
  const initialModel = 0;
  const storageKey = 'todos-elmish_' + id;

  // Load the model from localStorage or use the initial model
  const storedModel = localStorage.getItem(storageKey);
  const model = storedModel ? JSON.parse(storedModel) : initialModel;

  // Custom update function that also updates localStorage
  const updateWithStorage = (action: string, currentModel: number): number => {
    const newModel = update(action, currentModel);
    localStorage.setItem(storageKey, JSON.stringify(newModel));
    return newModel;
  };

  mount(model, updateWithStorage, view, id, subscriptions);
}
