/* global angular */

import GuestListPageApp from '../react/containers/GuestListPageApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('guestListPageReactController', reactPageFactory(GuestListPageApp));
