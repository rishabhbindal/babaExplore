import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Provider } from 'react-redux';
import { inspect } from 'import-inspector';
import { Helmet } from 'react-helmet';

import { StaticRouter, matchPath } from 'react-router-dom';

import appPaths from './appPaths.js';
import createAppStore from './createAppStore.js';

import App from './App.jsx';

const ServerApp = ({ url, store }) => {
    const context = {};

    return (
        <Provider store={store}>
            <StaticRouter
              location={url}
              context={context}
            >
                <App />
            </StaticRouter>
        </Provider>
    );
};

export default async function ({ url }) {
    const store = createAppStore({
        enableDevtoolExtension: false
    });

    try {
        await appPaths({ url, store });
    } catch (e) {
        console.log('e=', e);
    }

    const stateJSON = JSON.stringify(store.getState())
        .replace(/<\/script/g, '<\\/script')
        .replace(/<!--/g, '<\\!--');

    const imported = [];

    // setup a watcher
    let stopInspecting = inspect(metadata => {
        imported.push(metadata);
    });

    let appHTML = ReactDOMServer.renderToString(<ServerApp url={url} store={store} />);

    stopInspecting();

    const helmet = Helmet.renderStatic();
    return {
        imported,
        appHTML,
        headers: {
            meta: helmet.meta.toString(),
            title: helmet.title.toString()
        },
        stateStr: stateJSON
    };
}
