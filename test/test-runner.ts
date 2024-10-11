console.log('Test runner file is being executed');

import { glob } from 'glob';
import test from 'tape';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runTests() {
  try {
    console.log('Starting test runner...');
    console.log('Current directory:', __dirname);

    console.log('Searching for test files...');
    let testFiles;
    try {
      testFiles = await glob('**/*.test.ts', { cwd: __dirname });
      console.log('Found test files:', testFiles);
    } catch (globError) {
      console.error('Error while searching for test files:', globError);
      throw globError;
    }

    for (const file of testFiles) {
      const modulePath = `${__dirname}/${file}`;
      console.log(`Attempting to run tests in file: ${modulePath}`);
      try {
        await import(modulePath);
        console.log(`Successfully imported and ran tests in: ${modulePath}`);
      } catch (importError) {
        console.error(`Error importing or running tests in ${modulePath}:`, importError);
        throw importError;
      }
    }

    return new Promise<void>((resolve) => {
      test.onFinish(() => {
        console.log('All tests have finished');
        resolve();
      });
    });
  } catch (error) {
    console.error('Error in runTests function:', error);
    throw error;
  }
}

console.log('Initiating test runner...');
runTests().then(() => {
  console.log('Test runner completed successfully');
}).catch((error) => {
  console.error('Fatal error in test runner:', error);
  process.exit(1);
});
