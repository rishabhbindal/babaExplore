angular.module('explore').service('homePageService', ["$http", "$location", "dateFilter", "$filter", "$q", "ApiRequest", "globalFunctionsService",
    function ($http, $location, dateFilter, $filter, $q, ApiRequest, globalFunctionsService) {

    var getHomePageData = function (caption) {
        var deferred = $q.defer();

        var response = ApiRequest.responseWithCredentails(EXPLORE.urlHelper.promoted_list + '?caption=' + caption);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event'
                , eventCategory: 'Success'
                , eventAction: 'promoted_list'
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            //Error
            ga('send', {
                hitType: 'event'
                , eventCategory: 'Failure'
                , eventAction: 'promoted_list'
                , eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                console.log('error occured');
                localStorage.clear();
                window.location.reload();
            }
            deferred.resolve(false);
        });
        return deferred.promise;
    }

    var getGroupData = function (name) {
        var deferred = $q.defer();

        var response = ApiRequest.responseWithCredentails(EXPLORE.urlHelper.elt_groups + '?name=' + name);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event'
                , eventCategory: 'Success'
                , eventAction: 'elt_groups'
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            //Error
            ga('send', {
                hitType: 'event'
                , eventCategory: 'Failure'
                , eventAction: 'elt_groups'
                , eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                console.log('error occured');
                localStorage.clear();
                window.location.reload();
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    return {
        getHomePageData: getHomePageData
        , getGroupData: getGroupData
    }
}]);
