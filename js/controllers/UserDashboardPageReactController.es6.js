/* global angular */

import UserDashboardApp from '../react/containers/UserDashboardApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('userDashboardPageReactController', reactPageFactory(UserDashboardApp));
