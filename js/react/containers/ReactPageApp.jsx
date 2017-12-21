import React from 'react';

import AppStoreContext from '../containers/AppStoreContext.jsx';
import NgGotoContext from './NgGotoContext.jsx';
/* import EventsPageContainer from './EventsPageContainer.jsx';*/

const App = ({ ngGotoPath, ngUpdateLogin, ngGoBack, ngSetMissingDataCollected, ngSetSignupFromFb, children }) => (
    <AppStoreContext>
        <NgGotoContext
          ngGotoPath={ngGotoPath}
          ngUpdateLogin={ngUpdateLogin}
          ngGoBack={ngGoBack}
          ngSetMissingDataCollected={ngSetMissingDataCollected}
          ngSetSignupFromFb={ngSetSignupFromFb}
        >
            {children}
        </NgGotoContext>
    </AppStoreContext>
);

App.propTypes = {
    children: React.PropTypes.node,
    ngGotoPath: React.PropTypes.func,
    ngUpdateLogin: React.PropTypes.func,
    ngGoBack: React.PropTypes.func,
    ngSetMissingDataCollected: React.PropTypes.func,
    ngSetSignupFromFb: React.PropTypes.func
};

export default App;
