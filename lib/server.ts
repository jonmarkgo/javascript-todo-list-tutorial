// Zero Dependencies Node.js HTTP Server for running static on localhost
import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

const __dirname = path.resolve();

console.log('Server starting...');
console.log('cwd', __dirname);

const index: string = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');
const favicon: Buffer = fs.readFileSync(path.resolve(__dirname, 'dist/favicon.ico'));
const app: string = fs.readFileSync(path.resolve(__dirname, 'dist/todo-app.js'), 'utf8');
const elmish: string = fs.readFileSync(path.resolve(__dirname, 'dist/elmish.js'), 'utf8');
const appcss: string = fs.readFileSync(path.resolve(__dirname, 'dist/todomvc-app.css'), 'utf8');
const basecss: string = fs.readFileSync(path.resolve(__dirname, 'dist/todomvc-common-base.css'), 'utf8');

console.log('Files loaded successfully');

http.createServer((req: http.IncomingMessage, res: http.ServerResponse) => {
  console.log("Received request for URL:", req.url);

  if (!req.url) {
    console.log("No URL provided in request");
    res.writeHead(404, {'Content-Type': 'text/plain'});
    return res.end('404 Not Found');
  }

  if (req.url.indexOf('favicon') > -1) {
    console.log("Serving favicon");
    res.writeHead(200, {'Content-Type': 'image/x-icon'});
    return res.end(favicon);
  }

  if (req.url.indexOf('/dist/') > -1 && (req.url.endsWith('.js') || req.url.endsWith('.ts') || !path.extname(req.url))) {
    console.log("Serving JavaScript file:", req.url);
    const jsFile = req.url.split('/dist/')[1];
    const filePath = path.resolve(__dirname, 'dist', jsFile + (path.extname(jsFile) ? '' : '.js'));
    console.log("Resolved file path:", filePath);
    fs.readFile(filePath, (err, content) => {
      if (err) {
        console.error("Error reading file:", err);
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Not Found');
      } else {
        console.log("Successfully read file, sending response");
        res.writeHead(200, {'Content-Type': 'application/javascript'});
        res.end(content);
      }
    });
    return;
  }

  if (req.url.indexOf('.css') > -1) {
    console.log("Serving CSS file:", req.url);
    res.writeHead(200, {'Content-Type': 'text/css'});
    return res.end(req.url.indexOf('base') > -1 ? basecss : appcss);
  }

  console.log("Serving index.html");
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(index);
}).listen(process.env.PORT || 8000, () => {
  console.log(`Server running on port ${process.env.PORT || 8000}`);
});
