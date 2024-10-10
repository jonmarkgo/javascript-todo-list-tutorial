import './setup';
import tape from 'tape';

console.log('Starting run-tests.ts');

process.on('uncaughtException', (error: unknown) => {
  console.error('Uncaught Exception:', error);
  if (error instanceof Error) {
    console.error('Error stack:', error.stack);
  }
  process.exit(1);
});

console.log('Global error handler set up');

async function runTests(testFile: string) {
  console.log(`Importing ${testFile}...`);
  const testModule = await import(`./${testFile}.js`);
  console.log(`${testFile} imported successfully`);

  return new Promise<void>((resolve) => {
    const harness = tape.createHarness();
    harness.createStream().pipe(process.stdout);

    harness(`${testFile} Tests`, async (t) => {
      try {
        console.log(`Executing ${testFile}...`);
        await testModule.default(t);
        console.log(`${testFile} executed successfully`);
      } catch (error) {
        console.error(`Error in ${testFile}:`, error);
        if (error instanceof Error) {
          console.error('Error stack:', error.stack);
        }
        t.fail(`${testFile} failed due to error`);
      } finally {
        t.end();
        resolve();
      }
    });
  });
}

async function runAllTests() {
  try {
    console.log('Running Elmish tests...');
    await runTests('elmish.test');
    console.log('Elmish tests completed');

    console.log('Running Todo App tests...');
    await runTests('todo-app.test');
    console.log('Todo App tests completed');

    console.log('All tests completed successfully');
  } catch (error) {
    console.error('Error running tests:', error);
    if (error instanceof Error) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

console.log('Starting test execution...');
runAllTests().then(() => {
  console.log('Test execution finished');
  process.exit(0);
}).catch((error) => {
  console.error('Unhandled error during test execution:', error);
  if (error instanceof Error) {
    console.error('Error stack:', error.stack);
  }
  process.exit(1);
});

process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (reason instanceof Error) {
    console.error('Error stack:', reason.stack);
  }
  process.exit(1);
});

console.log('run-tests.ts setup complete');
