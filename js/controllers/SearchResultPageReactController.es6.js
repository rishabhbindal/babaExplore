/* global angular */

import SearchResultApp from '../react/containers/SearchResultApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('searchResultPageReactController', reactPageFactory(SearchResultApp));
