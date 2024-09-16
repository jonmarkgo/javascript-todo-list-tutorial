declare module 'qunit' {
  interface Assert {
    ok(value: any, message?: string): void;
    equal(actual: any, expected: any, message?: string): void;
    deepEqual(actual: any, expected: any, message?: string): void;
  }

  interface TestFunction {
    (assert: Assert): void;
  }

  function test(name: string, callback: TestFunction): void;

  export { test, Assert };
}
