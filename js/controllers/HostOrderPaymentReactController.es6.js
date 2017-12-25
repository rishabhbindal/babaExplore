/* global angular */

import HostOrderPaymentApp from '../react/containers/HostOrderPaymentApp.jsx';
import reactPageFactory from '../lib/reactPageFactory.es6.js';

angular.module('explore')
    .directive('hostOrderPaymentReactController', reactPageFactory(HostOrderPaymentApp));
