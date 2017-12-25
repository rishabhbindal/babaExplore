import React from 'react';

import { Switch, Route } from 'react-router-dom';

import HostPageContainer from './HostPageContainer.jsx';
import HostPropertiesContainer from './HostPropertiesContainer.jsx';
import UpcomingBookingsContainer from './UpcomingBookingsContainer.jsx';
import PastBookingsContainer from './PastBookingsContainer.jsx';
import HostExperiencePendingContainer from './HostExperiencePendingContainer.jsx';
import HostExperiencesContainer from './HostExperiencesContainer.jsx';
import PastExperiencesContainer from './PastExperiencesContainer.jsx';
import UpcomingExperiencesContainer from './UpcomingExperiencesContainer.jsx';


const HostPages = () => (
    <Switch>
        <Route path="/host/properties/upcoming" component={UpcomingBookingsContainer} />
        <Route path="/host/properties/history" component={PastBookingsContainer} />
        <Route path="/host/properties" component={HostPropertiesContainer} />
        <Route path="/host/experiences/upcoming" component={UpcomingExperiencesContainer} />
        <Route path="/host/experiences/history" component={PastExperiencesContainer} />
        <Route path="/host/experiences/pending" component={HostExperiencePendingContainer} />
        <Route path="/host/experiences" component={HostExperiencesContainer} />
        <Route path="/host" component={HostPageContainer} />
    </Switch>
);

export default HostPages;
