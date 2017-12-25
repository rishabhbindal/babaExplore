/* global angular */

import EventsPageApp from '../react/containers/EventListPageApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('eventListPageReactController', reactPageFactory(EventsPageApp));
