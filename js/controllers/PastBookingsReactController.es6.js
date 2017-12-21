/* global angular */

import PastBookingsApp from '../react/containers/PastBookingsApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('pastBookingsPageReactController', reactPageFactory(PastBookingsApp));
