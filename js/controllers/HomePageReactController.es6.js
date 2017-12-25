/* global angular */

import HomePageApp from '../react/containers/HomePageApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('homePageReactController', reactPageFactory(HomePageApp));
