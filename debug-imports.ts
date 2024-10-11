console.log('Debug: Starting debug-imports.ts');

try {
  console.log('Debug: Importing tape');
  import('tape').then(() => {
    console.log('Debug: Successfully imported tape');
  }).catch((error) => {
    console.error('Debug: Error importing tape:', error);
  });

  console.log('Debug: Importing debug-elmish');
  import('./test/debug-elmish').then(() => {
    console.log('Debug: Successfully imported debug-elmish');
  }).catch((error) => {
    console.error('Debug: Error importing debug-elmish:', error);
  });

  console.log('Debug: Importing todo-app');
  import('./src/todo-app').then(() => {
    console.log('Debug: Successfully imported todo-app');
  }).catch((error) => {
    console.error('Debug: Error importing todo-app:', error);
  });

  console.log('Debug: Importing jsdom');
  import('jsdom').then(() => {
    console.log('Debug: Successfully imported jsdom');
  }).catch((error) => {
    console.error('Debug: Error importing jsdom:', error);
  });
} catch (error) {
  console.error('Debug: Uncaught error:', error);
}

console.log('Debug: Finished debug-imports.ts');
