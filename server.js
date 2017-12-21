/**
 * Server is run only for development. For production build, the
 * assets and files are compiled and served statically.
 */

const express = require('express');
const path = require('path');
const proxy = require('http-proxy-middleware');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

app.use('/eltApp', proxy({
    target: 'https://dev.explorelifetraveling.com',
    router: {
        'dev.localhost:3000': 'https://dev.explorelifetraveling.com',
        'prod.localhost:3000': 'https://www.explorelifetraveling.com'
    },
    secure: false,
    changeOrigin: true
}));

const arg = process.argv[2];
let baseDir;
if (!arg) {
    const webpack = require('webpack');
    const webpackMiddleware = require('webpack-dev-middleware');
    const webpackHotMiddleware = require('webpack-hot-middleware');
    const config = require('./config/webpack.config.dev.js');

    config.output.path = '/';

    const compiler = webpack(config);
    app.use(webpackMiddleware(compiler, {
        hot: true,
        publicPath: '/public/',
        quiet: false,
        noInfo: false,
        lazy: false,
        stats: { colors: true }
    }));

    app.use(webpackHotMiddleware(compiler, {
        log: console.log
    }));

    baseDir = __dirname;
} else {
    // serve from dist/ if *any* argument is given to npm start
    baseDir = path.join(__dirname, 'dist');
}


app.use(express.static(baseDir));

app.get('*', (req, res) => {
    res.sendFile(`${baseDir}/react.html`);
});

const port = process.env.PORT || 3000;
console.log(`Server started on port: ${port} serving ${baseDir}`); // eslint-disable-line no-console

app.listen(port, '127.0.0.1');
