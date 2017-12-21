/* global angular */

import HostPropertiesApp from '../react/containers/HostExperiencesApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('hostExperiencesReactController', reactPageFactory(HostPropertiesApp));
