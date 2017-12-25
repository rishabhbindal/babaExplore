/* global angular */

import CoworkApp from '../react/containers/CoworkApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('coworkPageReactController', reactPageFactory(CoworkApp));
