import { mount, empty } from './elmish';

const id = 'test-app';

interface Model {
    counters: number[];
}

interface Assert {
    equal: (actual: any, expected: any, message?: string) => void;
}

type TestFunction = (assert: Assert) => void;

function test(description: string, testFn: TestFunction): void {
    // Test implementation goes here
}

// Declare update and view functions since they're not imported
declare function update(action: string, model: Model): Model;
declare function view(model: Model, signal: (action: string, data?: any) => void): HTMLElement;

test('update({counters:[0]}) returns {counters:[0]} (current state unmodified)', function (assert: Assert) {
    const result = update('', { counters: [0] });
    assert.equal(result.counters[0], 0);
});

test('Test Update increment: update("inc", {counters: [1]}) returns {counters: [2]}', function (assert: Assert) {
    const result = update("inc", { counters: [1] });
    console.log('result', result);
    assert.equal(result.counters[0], 2);
});

test('Test Update decrement: update("dec", {counters: [1]}) returns 0', function (assert: Assert) {
    const result = update("dec", { counters: [1] });
    assert.equal(result.counters[0], 0);
});

test('Test negative state: update("inc", {counters: [-9]}) returns -8', function (assert: Assert) {
    const result = update("inc", { counters: [-9] });
    assert.equal(result.counters[0], -8);
});

test('mount({model: 7, update: update, view: view}, "' + id + '") sets initial state to 7', function (assert: Assert) {
    mount({ counters: [7] }, update, view, id);
    const element = document.getElementById(id);
    if (element) {
        const state = element.getElementsByClassName('count')[0]?.textContent;
        assert.equal(state, '7');
    }
});

test('empty("test-app") should clear DOM in root node', function (assert: Assert) {
    const element = document.getElementById(id);
    if (element) {
        empty(element);
        mount({ counters: [7] }, update, view, id);
        empty(element);
        const result = element.innerHTML;
        assert.equal(result, '');
    }
});

test('click on "+" button to re-render state (increment model by 1)', function (assert: Assert) {
    const div = document.createElement('div');
    div.id = id;
    document.body.appendChild(div);
    mount({ counters: [7] }, update, view, id);
    const element = document.getElementById(id);
    if (element) {
        const incButton = element.getElementsByClassName('inc')[0] as HTMLElement;
        incButton.click();
        const state = element.getElementsByClassName('count')[0]?.textContent;
        assert.equal(state, '8'); // model was incremented successfully
        empty(element); // clean up after tests
    }
});

// Reset Functionality
test('Test reset counter when model/state is 7 returns 0', function (assert: Assert) {
    const result = update("reset", { counters: [7] });
    assert.equal(result.counters[0], 0);
});

test('reset button should be present on page', function (assert: Assert) {
    const reset = document.getElementsByClassName('reset');
    assert.equal(reset.length, 3);
});

test('Click reset button resets state to 0', function (assert: Assert) {
    mount({ counters: [7] }, update, view, id);
    const root = document.getElementById(id);
    if (root) {
        assert.equal(root.getElementsByClassName('count')[0]?.textContent, '7');
        const btn = root.getElementsByClassName("reset")[0] as HTMLElement;
        btn.click(); // Click the Reset button!
        const state = root.getElementsByClassName('count')[0]?.textContent;
        assert.equal(state, '0'); // state was successfully reset to 0!
        empty(root); // clean up after tests
    }
});
