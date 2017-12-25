const fs = require('fs');
const express = require('express');
const proxy = require('http-proxy-middleware');
const compression = require('compression');
const path = require('path');
const handlebars = require('handlebars');

const dpath = 'public/serverApp.js';
const renderServerApp = require(`./${dpath}`).default;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const app = express();

let baseDir = __dirname;

const templatePath = `${baseDir}/public/react-out.hbs`;
let staticPath = `${baseDir}/public`;
const maxAge = 350 * 24 * 60 * 60 * 1000;

const shouldCompress = (req, res) => {
    if (req.headers['x-no-compression']) {
        // don't compress responses with this request header
        return false;
    }

    return compression.filter(req, res);
};

app.use(compression({ filter: shouldCompress }));


if (process.env.NODE_ENV !== 'production') {
app.use('/eltApp', proxy({
    target: 'https://dev.explorelifetraveling.com',
    router: {
        'dev.localhost:3000': 'https://dev.explorelifetraveling.com',
        'prod.localhost:3000': 'https://www.explorelifetraveling.com'
    },
    secure: false,
    changeOrigin: true
}));
}

app.use('/public', express.static(staticPath, { maxAge }));
app.use('/images', express.static(path.join(staticPath, 'images'), { maxAge }));

const bodyTemplate = fs.readFileSync(templatePath, 'utf-8');

const webpackStats = require(path.join(__dirname, 'public/stats.generated.json'));
const modules = {};
const bundles = {};


webpackStats.modules.forEach(module => {
    const parts = module.identifier.split('!');
    const filePath = parts[parts.length - 1];
    modules[filePath] = module.chunks;
});

webpackStats.chunks.forEach(chunk => {
    bundles[chunk.id] = chunk.files;
});

const scripts = {};

app.get('*', async function ({ url }, res) {
    const { appHTML, stateStr, imported, headers } = await renderServerApp({ url });
    const enableAnalytics = process.env.DISABLE_ANALYTICS !== 'true';

    scripts[url] = scripts[url] || [];

    res.set('Cache-Control', 'no-cache');

    imported.forEach(({ currentModuleFileName, importedModulePath }) => {
        const file = path.join(path.dirname(currentModuleFileName), importedModulePath);
        let matchedBundles = modules[file];
        matchedBundles.forEach(bundle => {
            bundles[bundle].forEach(script => {
                if (scripts[url].indexOf(script) === -1) {
                    scripts[url].unshift(script);
                }
            });
        });
    });

    const template = handlebars.compile(bodyTemplate);

    res.send(template({
        body: appHTML,
        headers,
        initialState: `window.__INITIAL_STATE__ = ${stateStr}`,
        title: 'Explore Life Traveling',
        dynamicScripts: scripts[url],
        enableAnalytics: enableAnalytics
    }));
});

const port = process.env.PORT || 3000;
console.log(`Server started on port: ${port} serving ${baseDir}`); // eslint-disable-line no-console

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});

app.listen(port, '127.0.0.1');
