/* global angular */

import PrivacyPageApp from '../react/containers/PrivacyPageApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('privacyPageReactController', reactPageFactory(PrivacyPageApp));
