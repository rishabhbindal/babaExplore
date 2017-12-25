import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import { reducers } from './reducers';

const isBrowser = process.env.ELT_IS_NOT_BROWSER !== 'true';

export default ({
    enableDevtoolExtension = true,
    enableLogger = false
} = {}) => {
    const initialState = (isBrowser && window.__INITIAL_STATE__) || undefined;

    let reduxDevtool;
    if (isBrowser && enableDevtoolExtension) {
        reduxDevtool = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__();
    }

    const middlewares = [thunk];

    if (enableLogger && process.env.NODE_ENV !== 'production') {
        middlewares.push(createLogger({
            collapsed: true,
            diff: true
        }));
    }

    const store = createStore(
        reducers,
        initialState,
        compose(
            applyMiddleware(...middlewares),
            reduxDevtool || (f => f)
        )
    );

    return store;
};
