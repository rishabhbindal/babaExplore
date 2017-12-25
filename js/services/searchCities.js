angular.module('explore').service('searchCities', [function () {

    function name(searchCity) {
        var name = searchCity.city ? searchCity.city : searchCity.state;
        return name.toLowerCase();
    }

    return {
        get: function (searchCities, scope) {
            searchCities.sort(function (a, b) {
                return name(a) > name(b) ? 1 : name(a) < name(b) ? -1 : 0;
            });

            scope.cities = searchCities;

            angular.forEach(scope.cities, function(val, key) {
                scope.cities[key].city = val.city.capitalize();
                scope.cities[key].state = val.state.capitalize();
            });
            window.eltInit($('*[data-init]').toArray());
        },
    }
}]);
