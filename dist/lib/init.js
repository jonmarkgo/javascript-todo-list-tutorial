import { mount } from './elmish';
import { update, view, subscriptions } from './todo-app';
const model = {
    todos: [],
    hash: '#/', // the "route" to display
};
mount(model, update, view, 'app', subscriptions);
//# sourceMappingURL=init.js.map