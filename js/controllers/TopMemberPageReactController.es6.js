/* global angular */

import TopMemberPageApp from '../react/containers/TopMemberPageApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('topMemberPageReactController', reactPageFactory(TopMemberPageApp));
