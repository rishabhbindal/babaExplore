angular.module('explore').directive('searchFilter',
	['$location', '$routeParams', 'urlHelper', 'search', function ($location, $routeParams, urlHelper, search) {
	return {
		restrict: 'E',
		templateUrl: 'search-filter.html',
		scope: {
			cities: "=",
			filter: "=",
			prefix: "@"
		},
		link: function (scope, element) {
			scope.search = function () {
				search.search(scope);
			};
		}
	};
}]);
