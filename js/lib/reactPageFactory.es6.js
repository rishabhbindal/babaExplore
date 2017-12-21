import React from 'react';
import ReactDOM from 'react-dom';

export default (ReactPageComponent) => {
    function ReactApp($routeParams, $location, $rootScope, $window) {
        return {
            restrict: 'E',
            scope: {},
            link: (scope, el) => {
                const { propertyCode, communityName } = $routeParams;
                /**
                 * Because we are using angular for routing, we have to
                 * use $location to make angular go to /sign-up page.
                 *
                 * $apply is for angular to notice the change. Ex:
                 * @see https://www.sitepoint.com/understanding-angulars-apply-digest/
                 */
                const ngGotoPath = (base, search) => scope.$apply(() => {
                    if (!scope.$$phase) {
                        const path = $location.path(base);
                        if (search) {
                            path.search(search);
                        }
                    }
                });

                const ngUpdateLogin = login => scope.$apply(() => {
                    $rootScope.alreadyLogin = login ? 1 : 0;
                });

                const ngGoBack = () => scope.$apply(() => $window.history.back());

                const ngSetMissingDataCollected = () => scope.$apply(() => {
                    $rootScope.missingDataCollected = true;
                });

                const ngSetSignupFromFb = val => scope.$apply(() => {
                    $rootScope.signupFromFb = val;
                });

                ReactDOM.render(React.createElement(ReactPageComponent, {
                    propertyCode,
                    communityName,
                    ngGotoPath,
                    ngUpdateLogin,
                    routeParams: $routeParams,
                    ngGoBack,
                    ngSetMissingDataCollected,
                    ngSetSignupFromFb
                }), el[0]);
            }
        };
    }

    ReactApp.$inject = ['$routeParams', '$location', '$rootScope', '$window'];

    return ReactApp;
};
