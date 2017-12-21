/* global angular */

import SignupPageApp from '../react/containers/SignupPageApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('signupPageReactController', reactPageFactory(SignupPageApp));
