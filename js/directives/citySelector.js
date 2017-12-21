angular.module('explore').directive('citySelector',
	['dataService', function (dataService) {
	return {
		restrict: 'E',
		templateUrl: 'city-selector.html',
		scope: {
			filter: '=',
			cities: '='
		},
		link: function (scope, element) {
			scope.resetCity = function () {
				scope.filter.city_state = "";    
				scope.filter.city = "";
				scope.filter.state = "";
				element.find('#city-name').val('');
			};

			var format = scope.format = function (city) {
				return [city.city, city.state].filter(function (val) {
					return !!val;
				}).join(', ');
			};

			scope.setCity = function (city) {

				// clear out old value to prevent error when city.city is ""
				scope.resetCity();

				scope.filter.city_state = format(city);
			};
		}
	};
}]);
