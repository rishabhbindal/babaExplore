/* global angular */

import HostPropertiesApp from '../react/containers/HostPropertiesApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('hostPropertiesReactController', reactPageFactory(HostPropertiesApp));
