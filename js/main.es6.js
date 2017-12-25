/* global angular, document, window */
import utils from './utils.js';
import intlTelInputUtilsUrl from '../public/intlTelInputUtils.js';

const throttle = utils.throttle;
const $ = window.$;

function AppRouter($routeProvider, $locationProvider, $facebookProvider, ipnConfig, $compileProvider) {
    $facebookProvider.setAppId('411531465722273').setPermissions(['email', 'public_profile', 'user_friends']);

    ipnConfig.defaultCountry = 'in';
    ipnConfig.preferredCountries = ['in', 'us'];
    ipnConfig.autoPlaceholder = false;
    ipnConfig.nationalMode = true;
    ipnConfig.utilsScript = intlTelInputUtilsUrl;

    $routeProvider

        // .when('/host/experiences', {
        //     template: '<host-experiences-react-controller></hosts-page-react-controller>',
        //     controller: function reactController() {},
        //     requireAuth: true
        // })
        // .when('/host/experiences/pending', {
        //     template: '<host-experience-pending-react-controller></hosts-page-react-controller>',
        //     controller: function reactController() {},
        //     requireAuth: true
        // })
        // .when('/host/experiences/upcoming', {
        //     template: '<upcoming-experiences-page-react-controller></upcoming-experiences-page-react-controller>',
        //     controller: function reactController() {},
        //     requireAuth: true
        // })
        // .when('/host/experiences/history', {
        //     template: '<past-experiences-page-react-controller></past-experiences-page-react-controller>',
        //     controller: function reactController() {},
        //     requireAuth: true
        // })

        .when('/listing/:propCode', {
            templateUrl: 'listing.html',
            controller: 'ListingController'
        })
        .otherwise({
            template: '<script>window.location.href = location.pathname + location.search;</script>'
        });

    // use the HTML5 History API
    $locationProvider.html5Mode({
        enabled: true,
        rewriteLinks: false
    });

    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|whatsapp):/);
}

AppRouter.$inject = ['$routeProvider', '$locationProvider', '$facebookProvider', 'ipnConfig', '$compileProvider'];

const app = angular.module('explore', ['ngRoute', 'ngResource', 'templatescache', 'ngSanitize', 'ngMap', 'ngFacebook', 'ngDialog', 'afkl.lazyImage', 'internationalPhoneNumber']);

app.config(AppRouter);

app.directive('appFooter', () => ({
    templateUrl: 'footer.html'
}));

app.directive('appHeader', () => ({
    templateUrl: 'header.html'
}));

app.run(['$rootScope', '$location', '$route', ($rootScope, $location, $route) => {
    $rootScope.$watch('alreadyLogin', (newValue) => {
        const currentRoute = Object.values($route.routes).find(obj => obj.regexp.test($location.path()));
        if (currentRoute.requireAuth && newValue === 0) {
            $location.url('/');
        }
    });
}]);

app.run(['$rootScope', ($rootScope) => {
    $rootScope.$on('$routeChangeSuccess', () => {
        $(document).foundation();
    });
}]);

app.run(['$rootScope', '$window', ($rootScope, $window) => {
    const fbScript = (d, s, id) => {
        const fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        const js = d.createElement(s);
        js.id = id;
        js.src = '//connect.facebook.net/en_US/sdk.js';
        fjs.parentNode.insertBefore(js, fjs);
    };
    fbScript(document, 'script', 'facebook-jssdk');
    $rootScope.$on('fb.load', () => {
        $window.dispatchEvent(new Event('fb.load'));
    });

    $rootScope.userDetails = utils.GetJSONifNeeded(window.localStorage['userDetails']);
}]);

app.directive('owlCarousel', () => {
    return {
        restrict: 'E',
        transclude: false,
        link: (scope) => {
            scope.initCarousel = (element) => {
                const customOptions = scope.$eval($(element).attr('data-options'));

                // init carousel
                $(element).owlCarousel(Object.assign({}, customOptions));
            };
        }
    };
})
    .directive('owlCarouselItem', [() => {
        return {
            restrict: 'A',
            transclude: false,
            link: (scope, element) => {
                // wait for the last item in the ng-repeat then call init
                if (scope.$last) {
                    scope.initCarousel(element.parent());
                }
            }
        };
    }])
    .directive('infiniteScroll', [() => {
        return {
            restrict: 'A',
            scope: {
                onScroll: '&'
            },
            link: ($scope) => {
                const handler = throttle(() => {
                    const footerHeight = $('footer').height();
                    const unscrolled = $(document).height() - $(window).height() - document.body.scrollTop - footerHeight;
                    if (unscrolled < ($(window).height()*1)) {
                        $scope.$apply(() => {
                            $scope.onScroll();
                        });
                    }
                }, 300);
                $(window).on('scroll', handler);
                $scope.$on('$destroy', () => {
                    $(window).off('scroll', handler);
                });
            }
        };
    }])
    .directive('hires', [() => ({
            restrict: 'A',
            link: (scope, element, attrs) => {
                const shouldLoad = () => {
                    const elemOffset = $(element[0]).offset().top;

                    return (elemOffset - document.body.scrollTop) < ($(window).height() * 2);
                };
                const loadImage = () => {
                    if (shouldLoad()) {
                        const img = new Image();
                        img.src = attrs.hires;
                        img.onload = () => {
                            element[0].src = attrs.hires;
                            $(window).off('scroll', loadImage);
                        };
                    }
                };

                $(window).on('scroll', loadImage);

                scope.$watch(() => attrs.hires, loadImage);

                scope.$on('$destroy', () => {
                    $(window).off('scroll', loadImage);
                });
            }
    })]);

app.filter('range', () => (input, min, max) => {
    const start = parseInt(min, 10);
    const end = parseInt(max, 10);

    return [...Array(end - start).keys()].map(i => start + i);
});

app.filter('trimText', () => (value) => {
    if (value && value.length > 80) {
        value = value ? String(value).replace(/<[^>]+>/gm, '') : '';
        value = value.replace(/\r?\n|\r/g, '');
        value = value.replace(/^(.{80}[^\s]*).*/, '$1');
        value += '...';
    }
    return value;
});

app.filter('trimReviewText', () => (value) => {
    if (value) {
        value = value ? String(value).replace(/<[^>]+>/gm, '') : '';
        value = value.replace(/\r?\n|\r/g, '');
        value = value.replace(/^(.{180}[^\s]*).*/, '$1');
        value += '...';
    }
    return value;
});

app.filter('removeTags', () => (value) => {
    if (value) {
        value = value ? String(value).replace(/<[^>]+>/gm, '') : '';
    }
    return value;
});

app.directive('autoFolded', ['$window', '$timeout', 'ngDialog',
    ($window, $timeout, ngDialog) => ({
        restrict: 'AE',
        scope: {
            about: '@',
            role: '@'
        },
        link: (scope, element) => {
            const content = element[0];
            const init = () => {
                const contentHeight = element[0].offsetHeight;
                if (contentHeight > 430) {
                    element.addClass('folded-div');
                    element.bind('click', () => {
                        ngDialog.openConfirm({
                            template: `\
                                <p>${scope.about}</p>
                                <p>${scope.role}</p>
                                <div class="ngdialog-buttons">
                                <button
                                  type="button"
                                  class="ngdialog-button
                                  ngdialog-button-primary"
                                  ng-click="closeThisDialog(0)"
                                >
                                    Close
                                </button>
                                </div>`,
                            plain: true
                        });
                    });
                }
            };
            $timeout(() => {
                init();
            }, 0);
        }
})]);

app.filter('dateSuffix', ['$filter', ($filter) => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    return (input) => {
        const dtfilter = $filter('date')(input, 'MMMM dd');
        if (dtfilter) {
            const day = parseInt(dtfilter.slice(-2));
            const relevantDigits = (day < 30) ? day % 20 : day % 30;
            const suffix = (relevantDigits <= 3) ? suffixes[relevantDigits] : suffixes[0];
            return suffix;
        } else {
            return '';
        }
    };
}]);

app.filter('dateDiff', () => {
    const magicNumber = (1000 * 60 * 60 * 24);

    return (toDate, fromDate) => {
        if (toDate && fromDate) {
            const dayDiff = Math.floor((new Date(toDate).getTime() - new Date(fromDate).getTime()) / magicNumber);
            if (angular.isNumber(dayDiff)) {
                return dayDiff + 1;
            }
        }
    };
});

app.filter('reverse', () => items => items.slice().reverse());

app.filter('firstWords', () => str =>
           str.indexOf(' ') === -1 ? str : str.substr(0, str.indexOf(' '))
          );
