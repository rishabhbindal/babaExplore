/* global angular */

import HostExperiencePendingApp from '../react/containers/HostExperiencePendingApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('hostExperiencePendingReactController', reactPageFactory(HostExperiencePendingApp));
