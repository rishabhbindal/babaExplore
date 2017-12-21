/* global angular */

import UpcomingExperiencesApp from '../react/containers/UpcomingExperiencesApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('upcomingExperiencesPageReactController', reactPageFactory(UpcomingExperiencesApp));
