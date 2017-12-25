/* global angular */

import SearchFilterApp from '../react/containers/SearchFilterApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('searchFilterPageReactController', reactPageFactory(SearchFilterApp));
