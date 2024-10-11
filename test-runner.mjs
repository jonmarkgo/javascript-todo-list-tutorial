import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { globby } from 'globby';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runTests() {
  const testFiles = await globby('src/test/*.ts');

  for (const file of testFiles) {
    console.log(`Running test file: ${file}`);
    const child = spawn('node', [
      '--loader', 'ts-node/esm',
      '--experimental-specifier-resolution=node',
      file
    ], { stdio: 'inherit' });

    await new Promise((resolve, reject) => {
      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Test file ${file} failed with exit code ${code}`));
        } else {
          resolve();
        }
      });
    });
  }
}

runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});
