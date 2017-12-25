angular.module('explore').directive('sortByPrice',
  [function () {
    return {
      restrict: 'E',
      templateUrl: 'sort-by-price.html',
      scope: {
        cities: "=",
        filter: "=",
      },
    };
  }]);
