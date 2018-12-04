import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import express from 'express';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHot from 'webpack-hot-middleware';
import config from './webpack.config';

// Create express application and attach middleware
const app = express();
const compiler = webpack(config[0]);
app.use(webpackMiddleware(compiler, {
  publicPath: config[0].output.publicPath,
  stats: {
    colors: true,
    hash: false,
    timings: true,
    chunks: false,
    chunkModules: false,
    modules: false
  }
}));
app.use(webpackHot(compiler));

// Setup main route
app.get('/', (req, res) => {
  const body = fs
    .readFileSync(path.join(__dirname, 'src/index.html'), 'utf8')
    .replace(
      '${SCRIPTS}',
      '<script src="/dist/bundle.js"></script><script src="/dist/src.js"></script>'
    );
  res.set('content-type', 'text/html');
  res.send(body);
});

// Redirect unknown routes
app.get('*', (req, res) => res.redirect('/'));

// Start the server
app.listen(3000, (err) => {
  if (err) {
    return console.error(err);
  }

  console.log('Listening at http://localhost:3000/');
});
