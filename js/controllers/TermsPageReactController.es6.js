/* global angular */

import TermsPageApp from '../react/containers/TermsPageApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('termsPageReactController', reactPageFactory(TermsPageApp));
