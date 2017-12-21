require('expose-loader?jQuery!expose-loader?$!jquery');
require('jquery-migrate');

jQuery.migrateTrace = false;

//jquery shims
require('intl-tel-input');
require('lightgallery/dist/js/lightgallery.js');
require('lightgallery/dist/js/lg-thumbnail.js');
require('lightgallery/dist/js/lg-fullscreen.js');
require('sweetalert');

//Angular related stuff
require('angular');
require('angular-route');
require('angular-resource');
require('angular-sanitize');
require('angular-lazy-image');
require('ngmap');
require('ng-facebook');
require('ng-dialog');
require('../node_modules/international-phone-number/releases/international-phone-number.js');

//Don't import locales
require('expose-loader?moment!moment/moment.js');

//NOTE:RJ Let's get rid of minified app.js & load relevant dependencies from here
//require('expose-loader?Foundation!../node_modules/foundation-sites/js/foundation.core.js');
//require('owl.carousel');
//foundation-datepicker
