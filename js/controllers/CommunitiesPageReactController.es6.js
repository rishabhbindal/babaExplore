/* global angular */

import CommunitiesPageApp from '../react/containers/CommunitiesPageApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('communitiesPageReactController', reactPageFactory(CommunitiesPageApp));
