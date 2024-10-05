// Zero Dependencies Node.js HTTP Server for running static on localhost
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('cwd', __dirname);

const index: string = fs.readFileSync(path.resolve(__dirname, '..', '..', 'index.html'), 'utf8');
const favicon: Buffer = fs.readFileSync(path.resolve(__dirname, '..', '..', 'lib', 'favicon.ico'));
const app: string = fs.readFileSync(path.resolve(__dirname, '..', 'lib', 'todo-app.js'), 'utf8');
const elmish: string = fs.readFileSync(path.resolve(__dirname, '..', 'lib', 'elmish.js'), 'utf8');
const appcss: string = fs.readFileSync(path.resolve(__dirname, '..', '..', 'lib', 'todomvc-app.css'), 'utf8');
const basecss: string = fs.readFileSync(path.resolve(__dirname, '..', '..', 'lib', 'todomvc-common-base.css'), 'utf8');

http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  console.log("URL:", req.url);

  if (!req.url) {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('404 Not Found');
    return;
  }

  let contentType: string;
  let content: string | Buffer;

  if (req.url.indexOf('favicon') > -1) {
    contentType = 'image/x-icon';
    content = favicon;
  } else if (req.url.indexOf('.js') > -1) {
    contentType = 'application/javascript; charset=utf-8';
    if (req.url.indexOf('elmish') > -1) {
      content = elmish;
    } else if (req.url.indexOf('todo-app') > -1) {
      content = app;
    } else {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('404 Not Found');
      return;
    }
  } else if (req.url.indexOf('.css') > -1) {
    contentType = 'text/css';
    if (req.url.indexOf('base') > -1) {
      content = basecss;
    } else {
      content = appcss;
    }
  } else {
    contentType = 'text/html';
    content = index;
  }

  res.writeHead(200, {'Content-Type': contentType});
  res.end(content);
}).listen(process.env.PORT || 8000);

console.log(`Server running at http://localhost:${process.env.PORT || 8000}/`);
