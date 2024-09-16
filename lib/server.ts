// Zero Dependencies Node.js HTTP Server for running static on localhost
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);

const projectRoot = path.resolve(__dirname, '..');
console.log('Project root:', projectRoot);

function readFileWithErrorHandling(filePath: string): string | Buffer | null {
  try {
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return null;
    }
    const stats = fs.statSync(filePath);
    if (!stats.isFile()) {
      console.error(`Path is not a file: ${filePath}`);
      return null;
    }
    return fs.readFileSync(filePath);
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error);
    return null;
  }
}

const index: string | null = readFileWithErrorHandling(path.resolve(projectRoot, 'index.html')) as string | null;
const favicon: Buffer | null = readFileWithErrorHandling(path.resolve(projectRoot, 'lib/favicon.ico')) as Buffer | null;
const appcss: string | null = readFileWithErrorHandling(path.resolve(projectRoot, 'lib/todomvc-app.css')) as string | null;
const basecss: string | null = readFileWithErrorHandling(path.resolve(projectRoot, 'lib/todomvc-common-base.css')) as string | null;

// Ensure bundlePath points to the correct location in the 'dist' directory
const bundlePath = path.resolve(projectRoot, 'dist', 'bundle.js');
console.log('Resolved bundle path:', bundlePath);

let bundle: string | null = null;
if (fs.existsSync(bundlePath)) {
  bundle = readFileWithErrorHandling(bundlePath) as string | null;
  if (bundle === null) {
    console.error('Failed to read bundle file. The application may not function correctly.');
    console.error('Please check file permissions and try again.');
  } else {
    console.log('Bundle file successfully read');
  }
} else {
  console.error('Bundle file not found at:', bundlePath);
  console.error('You may need to run the build process to generate the bundle.');
  console.error('Run "npm run webpack" to build the bundle.');
}

http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  console.log("URL:", req.url);
  if (req.url && req.url.indexOf('favicon') > -1) {
    if (favicon) {
      res.writeHead(200, {'Content-Type': 'image/x-icon'});
      res.end(favicon);
    } else {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Favicon not found');
    }
  }
  else if (req.url && req.url.indexOf('bundle.js') > -1) {
    if (bundle) {
      res.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8', 'Content-Language': 'en'});
      res.end(bundle);
    } else {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Bundle file not found. Please run "npm run webpack" to build the bundle.');
    }
  }
  else if (req.url && req.url.indexOf('.css') > -1) {
    res.writeHead(200, {'Content-Type': 'text/css'});
    if (req.url.indexOf('base') > -1 && basecss) {
      res.end(basecss);
    }
    else if (req.url.indexOf('app') > -1 && appcss) {
      res.end(appcss);
    }
    else {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('CSS file not found');
    }
  }
  else {
    if (index) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(index);
    } else {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Index file not found');
    }
  }
}).listen(process.env.PORT || 8000);

console.log(`Server running on port ${process.env.PORT || 8000}`);
