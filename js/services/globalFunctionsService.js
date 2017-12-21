var getToken = require('../utils.js').getToken;

angular.module('explore').service("globalFunctionsService", ["ApiRequest", function(ApiRequest) {
    var checkConnection = function() {
        if (navigator && navigator.connection && navigator.connection.type === 'none') {
            return false;
        }
        return true;
    };

    
    return {
        checkConnection: checkConnection
    };
}]);

angular.module('explore').factory('ApiRequest', ['$resource', '$http',
    function($resource, $http) {

        var doRequest = function(APIURL, params) {
            var path = APIURL;
            //console.log("DoRequest Params are " + JSON.stringify(params));
            var key = getToken();
            //return $resource(path,params);
            /*return $http({
               url: path,
               data: (params),
               //type: 'json',
               method: "GET",
               headers: {'Content-Type': 'application/json; charset=UTF-8','Authorization': key},
           });*/
            return $resource(path, {
                dorequest: {
                    method: 'GET',
                    params: {
                        data: params
                    },
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        'Authorization': key
                    }
                }
            });
        };
        var doRequestWithCredentials = function(APIURL, params) {
            var path = APIURL;
            var key = getToken();

            return $http({
                url: path,
                data: (params),
                //type: 'json',
                method: "GET",
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Authorization': key
                },
            });
        };

        var doRequestWithMethod = function(APIURL, params, method) {
            var path = APIURL;
            //console.log("doRequestWithMethod Params are " +JSON.stringify(params));
            var key = getToken();
            //return $resource(path,params);
            return $resource(path, {
                dorequest: {
                    method: method,
                    params: {
                        data: params
                    },
                    headers: {
                        'Content-Type': 'application/json; charset=UTF-8',
                        'Authorization': key
                    }
                }
            });
        };

        var doRequestWithMethodWithHttp = function(APIURL, params, method) {
            var path = APIURL;
            var key = getToken();

            return $http({
                url: path,
                data: (params),
                method: method,
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8',
                    'Authorization': key
                },
            });
        };

        return {
            response: function(url, param) {
                return doRequest(url, param);
            },
            responseWithCredentails: function(url, param) {
                return doRequestWithCredentials(url, param);
            },
            responseWithMethod: function(url, param, method) {
                return doRequestWithMethod(url, param, method);
            },
            responseWithMethodHttp: function(url, param, method) {
                return doRequestWithMethodWithHttp(url, param, method);
            },

        };
    }
]);

angular.module('explore').factory('allSettled', ['$q', function($q) {
        return function (promises) {
        function wrap(promise) {
            return $q.when(promise)
                .then(function (value) {
                    return { state: 'fulfilled', value: value };
                }, function (reason) {
                    return { state: 'rejected', reason: reason };
                });
        }

        var wrapped = [];

        angular.forEach(promises, function(promise) {
            wrapped.push(wrap(promise));
        });

        return $q.all(wrapped);
    };
    }
]);

// format srcset for ng-lazy-image
angular.module('explore').factory('getFormattedSrcset', [function() {
    return function(small, medium, retina) {

        var srcsets = [];
        var formatImageSrc = function (src, width) {
            if (!src) {
                return;
            }

            if (src.indexOf('http') > -1) {
                src = src.replace(/(https|http)[\/:]*/, '');
            } else {
                src = window.location.origin.replace(/(https|http)[\/:]*/, '') + '/' + src;
            }
            srcsets.push("//" + src + " " + width);
        }

        formatImageSrc(small, "640w");
        formatImageSrc(medium, "1025w");
        formatImageSrc(retina, "1441w");

        return srcsets.length ? srcsets.join(", ") : null;
    }
}]);
