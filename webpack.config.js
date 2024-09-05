const path = require('path');

module.exports = {
  entry: './lib/todo-app.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      name: 'TodoApp',
      type: 'var',
    },
    globalObject: 'this',
  },
  devtool: 'source-map',
};
