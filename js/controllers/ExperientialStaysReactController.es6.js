/* global angular */

import ExperientialStaysApp from '../react/containers/ExperientialStaysApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('experientialStaysReactController', reactPageFactory(ExperientialStaysApp));