// config.ts
import path from 'path';

const config = {
  rootDir: path.resolve(__dirname, '..'),
  indexHtmlPath: path.resolve(__dirname, '..', 'index.html'),
  serverPath: path.resolve(__dirname, 'lib', 'server.js'),
};

export default config;
