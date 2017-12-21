import React from 'react';
import { Provider } from 'react-redux';

import createAppStore from '../createAppStore.js';

const store = createAppStore();

const AppStoreContext = ({ children }) => (
    <Provider store={store}>
        {children}
    </Provider>
);
AppStoreContext.propTypes = {
    children: React.PropTypes.node.isRequired
};

export default AppStoreContext;
