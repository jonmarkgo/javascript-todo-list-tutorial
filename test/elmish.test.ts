import tape from 'tape';
import { mount, empty, div, button, text } from '../lib/elmish.js';

console.log('Starting elmish.test.ts');

function runElmishTests(t: tape.Test) {
  console.log('Starting test: elmish.mount renders counter-reset-keyboard');
  try {
    const root = document.getElementById('app');
    if (!root) {
      throw new Error('Root element with id "app" not found');
    }

    console.log('Root element found');

    const initialModel = 0;
    const storageKey = 'todos-elmish_app';

    // Load the model from localStorage or use the initial model
    const storedModel = localStorage.getItem(storageKey);
    const model = storedModel ? JSON.parse(storedModel) : initialModel;

    console.log('Model initialized:', model);

    // Custom update function that also updates localStorage
    const updateWithStorage = (action: string, currentModel: number): number => {
      const newModel = update(action, currentModel);
      localStorage.setItem(storageKey, JSON.stringify(newModel));
      return newModel;
    };

    console.log('About to call mount function');
    mount(model, updateWithStorage, view, 'app');
    console.log('Mount function called');

    t.equal(root.childNodes.length, 1, 'mount should render one child');
    console.log('Test assertion completed');
  } catch (error) {
    console.error('Error in test:', error);
    t.fail('Test failed due to error');
  }
}

function update(action: string, model: number): number {
  switch(action) {
    case 'inc': return model + 1;
    case 'dec': return model - 1;
    case 'reset': return 0;
    default: return model;
  }
}

function view(model: number, signal: (action: string) => void): HTMLElement {
  return div(['class=counter-reset-keyboard'], [
    button(['onclick=' + signal('dec')], [text('-') as unknown as HTMLElement]),
    div([], [text(model.toString()) as unknown as HTMLElement]),
    button(['onclick=' + signal('inc')], [text('+') as unknown as HTMLElement]),
    button(['onclick=' + signal('reset')], [text('Reset') as unknown as HTMLElement])
  ]);
}

console.log('Test file setup complete');

export default runElmishTests;
