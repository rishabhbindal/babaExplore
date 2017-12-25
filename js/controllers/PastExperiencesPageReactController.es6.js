/* global angular */

import PastExperiencesApp from '../react/containers/PastExperiencesApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('pastExperiencesPageReactController', reactPageFactory(PastExperiencesApp));
