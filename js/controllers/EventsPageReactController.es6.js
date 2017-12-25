/* global angular */

import EventsPageApp from '../react/containers/EventsPageApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('eventsPageReactController', reactPageFactory(EventsPageApp));
