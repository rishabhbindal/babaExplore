/* global angular */

import ExtraInfoApp from '../react/containers/ExtraInfoApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('extraInfoDirective', reactPageFactory(ExtraInfoApp));
