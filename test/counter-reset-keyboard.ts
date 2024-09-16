import { button, div, text } from 'elmish';

export type Model = number;
export type Action = 'inc' | 'dec' | 'reset';
export type Signal = (action: Action) => () => void;

export const update = (action: Action, model: Model): Model => {
  switch(action) {
    case 'inc': return model + 1;
    case 'dec': return model - 1;
    case 'reset': return 0;
    default: return model;
  }
};

export const view = (model: Model, signal: Signal) => {
  return div([], [
    button(["class=inc", "id=inc", signal('inc')], [text('+')]),
    div(["class=count", "id=count"], [text(model.toString())]),
    button(["class=dec", "id=dec", signal('dec')], [text('-')]),
    button(["class=reset", "id=reset", signal('reset')], [text('Reset')])
  ]);
};

export const subscriptions = (signal: Signal): void => {
  const UP_KEY = 38;
  const DOWN_KEY = 40;

  document.addEventListener('keyup', (e: KeyboardEvent) => {
    switch (e.keyCode) {
      case UP_KEY:
        signal('inc')();
        break;
      case DOWN_KEY:
        signal('dec')();
        break;
    }
  });
};
