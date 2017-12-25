/* global angular */

import HostsPageApp from '../react/containers/HostPageApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('hostPageReactController', reactPageFactory(HostsPageApp));
