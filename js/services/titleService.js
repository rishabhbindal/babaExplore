angular.module('explore').service('titleService', ['$rootScope', function ($rootScope) {
    return {
        setTitle: function (title, scope) {
            $rootScope.title = title;

            scope.$on('$destroy', resetTitle);

            function resetTitle() {
                $rootScope.title = $rootScope.defaultTitle;
            }
        },
    }
}]);