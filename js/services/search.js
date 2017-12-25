angular.module('explore').service('search',
  ['$location', 'urlHelper', '$routeParams',
  function ($location, urlHelper, $routeParams) {
    function search(scope) {
      var filter = angular.copy(scope.filter);
      var cityState = filter.city_state.split(',');
      if (cityState.length > 1) {
        filter.city = cityState[0].trim();
        filter.state = cityState[1].trim();
      } else {
        filter.state = cityState[0].trim();
      }

      var path = urlHelper.buildSearchPath(filter);
      var prefix = scope.prefix;
      if ($routeParams.name) {
        prefix += '/' + $routeParams.name;
      }

      if (path && (filter.city || filter.state || filter.sortByPrice)) {
        $location.url(prefix + '?' + path);
      } else {
        $location.url(prefix);
      }
    }

    return {
      search: search,
    };
  }]);
