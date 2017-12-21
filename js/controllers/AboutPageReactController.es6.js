/* global angular */

import AboutPageApp from '../react/containers/AboutPageApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('aboutPageReactController', reactPageFactory(AboutPageApp));
