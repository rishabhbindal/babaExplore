/* global angular */

import CommunityPageApp from '../react/containers/CommunityPageApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('communityPageReactController', reactPageFactory(CommunityPageApp));
