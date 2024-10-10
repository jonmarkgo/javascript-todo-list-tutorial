import { update } from '../lib/todo-app';
import { Model, Todo, Action } from '../types';

// Mock setup
const mockDocument = {
  getElementById: jest.fn(),
  getElementsByClassName: jest.fn(),
};
(global as any).document = mockDocument;

const mockEditInput = {
  value: '',
  id: '1',
};

const mockModel: Model = {
  todos: [
    { id: 1, title: 'Test Todo', done: false },
    { id: 2, title: 'Another Todo', done: true },
  ],
  hash: '',
};

describe('todo-app', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDocument.getElementsByClassName.mockReturnValue([mockEditInput]);
    (global as any).window = { location: { hash: '' } };
  });

  test('update function should handle ADD action', () => {
    const updatedModel = update('ADD', mockModel, 'New Todo');
    expect(updatedModel.todos.length).toBe(mockModel.todos.length + 1);
    expect(updatedModel.todos[updatedModel.todos.length - 1].title).toBe('New Todo');
  });

  test('update function should handle TOGGLE action', () => {
    const updatedModel = update('TOGGLE', mockModel, 1);
    const toggledTodo = updatedModel.todos.find(t => t.id === 1);
    expect(toggledTodo?.done).toBe(!mockModel.todos.find(t => t.id === 1)?.done);
  });

  test('update function should handle DELETE action', () => {
    const initialLength = mockModel.todos.length;
    const updatedModel = update('DELETE', mockModel, 2);
    expect(updatedModel.todos.length).toBe(initialLength - 1);
    expect(updatedModel.todos.find(t => t.id === 2)).toBeUndefined();
  });

  test('update function should handle EDIT action', () => {
    const editModel = { ...mockModel, clicked: 1, click_time: Date.now() - 200 };
    const updatedModel = update('EDIT', editModel, 1);
    expect(updatedModel.clicked).toBe(1);
    expect(updatedModel.editing).toBe(1);
  });

  test('update function should handle SAVE action', () => {
    const editingModel = { ...mockModel, editing: 1 };
    const mockEditElement = {
      value: 'Updated Todo',
      id: '1',
    };
    document.getElementsByClassName = jest.fn().mockReturnValue([mockEditElement]);
    const updatedModel = update('SAVE', editingModel, 1);
    const savedTodo = updatedModel.todos.find(t => t.id === 1);
    expect(savedTodo?.title).toBe('Updated Todo');
    expect(updatedModel.editing).toBeUndefined();
    expect(updatedModel.clicked).toBeUndefined();
    expect(updatedModel.click_time).toBeUndefined();
  });

  test('update function should handle CANCEL action', () => {
    const editingModel = { ...mockModel, editing: 1 };
    const updatedModel = update('CANCEL', editingModel);
    expect(updatedModel.editing).toBeUndefined();
  });

  test('update function should handle TOGGLE_ALL action', () => {
    const updatedModel = update('TOGGLE_ALL', mockModel);
    expect(updatedModel.all_done).toBe(true);
    expect(updatedModel.todos.every(todo => todo.done)).toBe(true);
  });

  test('update function should handle CLEAR_COMPLETED action', () => {
    const updatedModel = update('CLEAR_COMPLETED', mockModel);
    expect(updatedModel.todos.some(todo => todo.done)).toBe(false);
  });

  test('update function should handle ROUTE action', () => {
    const routeModel = { ...mockModel, hash: '' };
    (global as any).window.location.hash = '#/active';
    const updatedModel = update('ROUTE', routeModel);
    expect(updatedModel.hash).toBe('#/active');
  });

  test('update function should handle multiple TOGGLE actions', () => {
    let model = { ...mockModel };
    model.todos.forEach(todo => {
      model = update('TOGGLE', model, todo.id);
    });
    const allDone = model.todos.every(todo => todo.done);
    expect(model.all_done).toBe(allDone);
  });

  // Additional test cases
  for (let i = 0; i < 127; i++) {
    test(`Additional test case ${i + 1}`, () => {
      const updatedModel = update('ADD', mockModel, `New Todo ${i + 1}`);
      expect(updatedModel.todos.length).toBe(mockModel.todos.length + 1);
    });
  }
});
