/* global angular */

import UpcomingBookingsApp from '../react/containers/UpcomingBookingsApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('upcomingBookingsPageReactController', reactPageFactory(UpcomingBookingsApp));
