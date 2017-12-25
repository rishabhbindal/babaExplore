import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { BrowserRouter } from 'react-router-dom';

import CheckMissingDetails from '../react/containers/CheckMissingDetails.jsx';
import AppStoreContext from '../react/containers/AppStoreContext.jsx';
import App from './App.jsx';

const render = () => {
    ReactDOM.render(
        <AppContainer>
            <AppStoreContext>
                <BrowserRouter>
                    <div>
                        <CheckMissingDetails />
                        <App />
                    </div>
                </BrowserRouter>
            </AppStoreContext>
        </AppContainer>,
        document.querySelector('#root')
    );
};

render(App);

if (module.hot) {
    module.hot.accept('./App.jsx', () => {
        render(App);
    });
}
