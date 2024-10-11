console.log('Debug: Starting minimal-import-test.ts');

async function testImports() {
  try {
    console.log('Debug: Importing tape');
    const tape = await import('tape');
    console.log('Debug: Successfully imported tape');

    console.log('Debug: Importing debug-elmish');
    const elmish = await import('./test/debug-elmish');
    console.log('Debug: Successfully imported debug-elmish');

    console.log('Debug: Importing todo-app');
    const todoApp = await import('./src/todo-app');
    console.log('Debug: Successfully imported todo-app');

    console.log('Debug: Importing jsdom');
    const jsdom = await import('jsdom');
    console.log('Debug: Successfully imported jsdom');

    console.log('All imports successful');
  } catch (error) {
    console.error('Error during import:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
  }
}

testImports();
