var utils = require('../utils.js');
var checkForLocalStorage = utils.checkForLocalStorage;
var deleteCookies = utils.deleteCookies;

angular.module('explore').service('dataService', ["$http", "$location", "dateFilter", "$filter", "$q", "ApiRequest", "globalFunctionsService", "$rootScope",
    function($http, $location, dateFilter, $filter, $q, ApiRequest, globalFunctionsService, $rootScope) {

    var clearStorageAndReload = function () {
        console.log('error occured');
        localStorage.clear();
        deleteCookies();
        window.location.reload();
    };

    var whoami = function() {
        var deferred = $q.defer();
        var response = ApiRequest.responseWithCredentails(EXPLORE.urlHelper.whoami);
        response.then(function(data, status) {
            if (checkForLocalStorage()) {
                window.localStorage['userDetails'] = GetJSONstringfyifNeeded(data.data);
            }

            $rootScope.userDetails = data.data;

            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: 'Whoami'
            });
            deferred.resolve(data.data);
        }, function(err, status) {
            //Error
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: 'Whoami',
                eventLabel: GetJSONstringfyifNeeded(err)
            });
            if (err.status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var getAppConfig = function () {
        var deferred = $q.defer();
        var response = ApiRequest.responseWithCredentails(EXPLORE.urlHelper.appconfig);
        response.success(function (data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: 'AppConfig',
            });

            deferred.resolve(data);
        }).error(function (data, status) {
            //Error
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: 'AppConfig',
                eventLabel: GetJSONstringfyifNeeded(data),
            });

            if (status == 403) {
                console.log('error occured');
                localStorage.clear();
                sessionStorage.clear();
                window.location.reload();
            }

            deferred.resolve(false);
        });

        return deferred.promise;
    };

    var getGroups = function() {
        var deferred = $q.defer();
        var response = ApiRequest.responseWithCredentails(EXPLORE.urlHelper.elt_groups + '?status=publish');
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: 'Elt groups'
            });
            deferred.resolve(data);
        }).error(function(data, status) {
            //Error
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: 'Elt groups',
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });
        return deferred.promise;
    }

    var joinGroup = function(name, join_message) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.elt_group_request;
        var params = {
            "group": name,
            "join_message": join_message
        };
        var response = ApiRequest.responseWithMethodHttp(url, params, "POST");
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data) {
            //Error
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(data);
        });
        return deferred.promise;
    }

    var getPendingGroupRequests = function() {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.elt_group_request+'?state=NOTIFICATION_SENT';

        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            //Error
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(data);
        });
        return deferred.promise;
    }

    var getAllGroups = function() {
        var deferred = $q.defer();
        var response = ApiRequest.responseWithCredentails(EXPLORE.urlHelper.elt_groups);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: 'Elt groups'
            });
            deferred.resolve(data.results);
        }).error(function(data,status) {
            //Error
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: 'Elt groups',
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }

            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var getMyListing = function(filterValue) {
        var deferred = $q.defer();

        var url = EXPLORE.urlHelper.properties;
        filter = '';
        if (filterValue.city)
            filter = filter + 'city=' + filterValue.city + '&';
        if (filterValue.state)
            filter = filter + 'state=' + filterValue.state + '&';
        if (filterValue.check_in)
            filter = filter + 'check_in=' + filterValue.check_in + '&';
        if (filterValue.check_out)
            filter = filter + 'check_out=' + filterValue.check_out + '&';
        if (filterValue.guest)
            filter = filter + 'guests=' + filterValue.guest + '&';
        if (filterValue.sortByPrice) {
            filter += 'sort_by=' + filterValue.sortByPrice + '&';
        }
        if (url)
            url = url + '?' + filter;
        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });
        return deferred.promise;
    }


    var getMyLoveListing = function(filterValue) {
        var deferred = $q.defer();

        var url = EXPLORE.urlHelper.love;
        filter = '';
        if (filterValue.city)
            filter = filter + 'city=' + filterValue.city + '&';

        if (filterValue.state)
            filter = filter + 'geo_state=' + filterValue.state + '&';
        if (filterValue.check_in)
            filter = filter + 'check_in=' + filterValue.check_in + '&';
        if (filterValue.check_out)
            filter = filter + 'check_out=' + filterValue.check_out + '&';
        if (filterValue.guest)
            filter = filter + 'guests=' + filterValue.guest + '&';
        if (filterValue.sortByPrice) {
            filter += 'sort_by=' + filterValue.sortByPrice + '&';
        }
        if (url)
            url = url + '?' + filter;

        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            //Error
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var getLoveWithGroupName = function(group,filterValue) {
        var deferred = $q.defer();

        var url = EXPLORE.urlHelper.love;
        var filter = '';
        if (filterValue.city)
            filter = filter + 'city=' + filterValue.city + '&';
        if (filterValue.state)
            filter = filter + 'geo_state=' + filterValue.state + '&';
        if (filterValue.check_in)
            filter = filter + 'check_in=' + filterValue.check_in + '&';
        if (filterValue.check_out)
            filter = filter + 'check_out=' + filterValue.check_out + '&';
        if (filterValue.guest)
            filter = filter + 'guests=' + filterValue.guest + '&';
        filter = filter + 'category=' + group;
        if (url)
            url = url + '?' + filter;

        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });
        return deferred.promise;
    }

    var getPropertyWithId = function(id) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.properties + id + '/';
        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });
        return deferred.promise;
    }

    var getPropertyWithCode = function(code) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.properties + '?code=' + code;
        var response = ApiRequest.responseWithCredentails(url);

        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });
        return deferred.promise;
    }

    var getPropertyWithGroupName = function(group,filterValue) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.properties;
        var filter = '';
        if (filterValue.city)
            filter = filter + 'city=' + filterValue.city + '&';
        if (filterValue.state)
            filter = filter + 'state=' + filterValue.state + '&';
        if (filterValue.check_in)
            filter = filter + 'check_in=' + filterValue.check_in + '&';
        if (filterValue.check_out)
            filter = filter + 'check_out=' + filterValue.check_out + '&';
        if (filterValue.guest)
            filter = filter + 'guests=' + filterValue.guest + '&';
        if (filterValue.sortByPrice) {
            filter += ('sort_by=' + filterValue.sortByPrice + '&');
        }
        filter = filter + 'category=' + group;
        if (url)
            url = url + '?' + filter;

        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });
        return deferred.promise;
    }

    var getCommunityWithName = function(name) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.elt_groups + '?name=' + name;
        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            var finalData = data.results[0];
            angular.forEach(data.results, function(value, key){
                if (value.name === name) {
                    finalData = value;
                }
            });
            deferred.resolve(finalData);
        }).error(function(err,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(err)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            //Error
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var getMyExperienceListing = function(filterValue) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.experience;
        filter = '';
        if (filterValue.city)
            filter = filter + 'city=' + filterValue.city + '&';

        if (filterValue.state)
            filter = filter + 'state=' + filterValue.state + '&';
        if (filterValue.category)
            filter = filter + 'category=' + filterValue.category + '&';
        if (url)
            url = url + '?' + filter;
        if (filter != "") {
            var response = ApiRequest.responseWithCredentails(url);
            response.success(function(data, status) {
                ga('send', {
                    hitType: 'event',
                    eventCategory: 'Success',
                    eventAction: url
                });
                deferred.resolve(data);
            }).error(function(err,status) {
                ga('send', {
                    hitType: 'event',
                    eventCategory: 'Failure',
                    eventAction: url,
                    eventLabel: GetJSONstringfyifNeeded(err)
                });
                if (status == 403) {
                    console.log('error occured');
                    localStorage.clear();
                    window.location.reload();
                }
                deferred.resolve(false);
            });
        } else {
            deferred.resolve(false);
        }

        return deferred.promise;
    }

    var getExperienceById = function(id) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.experience + id + '/';
        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(err,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(err)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            //Error
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var getExperienceByCode = function(code) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.experience + '?code=' + code;
        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data.results[0]);
        }).error(function(err,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(err)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var getMyOrders = function() {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.order;
        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            //Error
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(data);
        });

        return deferred.promise;
    }

    var getMyBooking = function() {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.booking;
        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(err,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(err)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }


    var getMyBookingById = function(id) {

        var deferred = $q.defer();

        var url = EXPLORE.urlHelper.booking + id + '/';

        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(err,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(err)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var addReview = function(data) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.review;
        if (!data.review || data.review == "") {
            arr = [];
            arr['detail'] = "Kindly enter review";
            deferred.resolve(arr);
        } else {
            var params = {
                "rating": {
                    "communication": data.rating.communication,
                    "accuracy": data.rating.accuracy,
                    "cleanliness": data.rating.cleanliness,
                    "location": data.rating.location,
                    "check_in": data.rating.check_in,
                    "value": data.rating.value
                },
                "review": data.review,
                "author": data.author,
                "property": data.property,
                "associated_order": data.associated_order
            };
            var response = ApiRequest.responseWithMethodHttp(url, params, "POST");
            response.success(function(data, status) {
                ga('send', {
                    hitType: 'event',
                    eventCategory: 'Success',
                    eventAction: url
                });
                deferred.resolve(true);
            }).error(function(data,status) {
                ga('send', {
                    hitType: 'event',
                    eventCategory: 'Failure',
                    eventAction: 'Review add',
                    eventLabel: GetJSONstringfyifNeeded(data)
                });
                if (status == 403) {
                    console.log('error occured');
                    localStorage.clear();
                    window.location.reload();
                }
                deferred.resolve(data);
            });
        }
        return deferred.promise;
    }

    var addExperienceReview = function(data) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.experience_review;
        var params = {
            "rating": {
                "communication": data.rating.communication,
                "accuracy": data.rating.accuracy,
                "cleanliness": data.rating.cleanliness,
                "location": data.rating.location,
                "check_in": data.rating.check_in,
                "value": data.rating.value
            },
            "review": data.review,
            "author": data.author,
            "experience": data.experience
        };

        var response = ApiRequest.responseWithMethodHttp(url, params, "POST");
            response.success(function(data, status) {
                ga('send', {
                    hitType: 'event',
                    eventCategory: 'Success',
                    eventAction: url
                });
                deferred.resolve(true);
            }).error(function(data,status) {
                ga('send', {
                    hitType: 'event',
                    eventCategory: 'Failure',
                    eventAction: 'Review add',
                    eventLabel: GetJSONstringfyifNeeded(data)
                });
                if (status == 403) {
                    console.log('error occured');
                    localStorage.clear();
                    window.location.reload();
                }
                deferred.resolve(data);
            });

        return deferred.promise;
    }

    var updateReview = function(data) {
        var deferred = $q.defer();
        if (!data.review || data.review == "") {
            arr = [];
            arr['detail'] = "Kindly enter review";
            deferred.resolve(arr);
        } else {
            var url = data.url;

            var params = {
                "rating": {
                    "communication": data.rating.communication,
                    "accuracy": data.rating.accuracy,
                    "cleanliness": data.rating.cleanliness,
                    "location": data.rating.location,
                    "check_in": data.rating.check_in,
                    "value": data.rating.value
                },
                "review": data.review,
                "author": data.author,
                "property": data.property,
                "associated_order": data.associated_order
            };
            var response = ApiRequest.responseWithMethodHttp(url, params, "PUT");
            response.success(function(data, status) {
                ga('send', {
                    hitType: 'event',
                    eventCategory: 'Success',
                    eventAction: url
                });
                deferred.resolve(true);
            }).error(function(data,status) {
                ga('send', {
                    hitType: 'event',
                    eventCategory: 'Failure',
                    eventAction: 'Review add',
                    eventLabel: GetJSONstringfyifNeeded(data)
                });
                if (status == 403) {
                    console.log('error occured');
                    localStorage.clear();
                    window.location.reload();
                }
                deferred.resolve(data);
            });
        }
        return deferred.promise;
    }


    var getReviewOfUser = function(id) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.review + '?user=' + id;

        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: 'Review add',
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(data);
        });

        return deferred.promise;
    }

    var getReviewForProperty = function(id) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.review + '?property=' + id;

        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(err,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(err)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var getReviewForExperience = function(id) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.experience_review + '?experience=' + id;

        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(err,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(err)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }
    var getMyOrderById = function(id) {

        var deferred = $q.defer();

        var url = EXPLORE.urlHelper.order + id + '/';

        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(err,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(err)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var getLoveById = function(id) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.love + id + '/';

        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(err,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(err)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var getMyExperienceBooking = function() {
        var deferred = $q.defer();

        var url = EXPLORE.urlHelper.experiencebooking;

        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(err,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(err)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });
        return deferred.promise;
    }

    var getMyExperienceBookingById = function(id) {
        var deferred = $q.defer();

        var url = EXPLORE.urlHelper.experiencebooking + id + '/';

        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(err,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(err)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var getCity = function(id) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.appconfig;
        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: 'AppConfig'
            });
            deferred.resolve(data.supported_cities);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: 'AppConfig',
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var loveProperty = function(property) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.love;
        var params = {
            "property": property
        };

        var response = ApiRequest.responseWithMethodHttp(url, params, "POST");
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: 'Love property',
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            if (data[0] == "An existing Love for the given Property already exists, for this User")
                deferred.resolve(true);
            else
                deferred.resolve(true);
        });


        return deferred.promise;
    }

    var getAllLoveProperty = function() {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.love;
        var params = {};
        var response = ApiRequest.responseWithCredentails(url);

        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: 'Love'
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: 'Love',
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });


        return deferred.promise;
    }

    var loveDelete = function(url) {
        var deferred = $q.defer();
        var params = {};
        var response = ApiRequest.responseWithMethodHttp(url, params, "DELETE");
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var checkAvailableProperty = function(params, url) {
        var deferred = $q.defer();
        //var url = EXPLORE.urlHelper.love;
        var response = ApiRequest.responseWithMethodHttp(url, params, "PATCH");
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: 'Check availability',
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            if (data[0] == "An existing Love for the given Property already exists, for this User")
                deferred.resolve(true);
            else
                deferred.resolve(false);
        });
        return deferred.promise;
    }

    var getCouponDetails = function(code) {
        var deferred = $q.defer();
        var params = {};
        var url = EXPLORE.urlHelper.coupon + '?coupon=' + code;
        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(err,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(err)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var orderSend = function(params) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.order;
        var response = ApiRequest.responseWithMethodHttp(url, params, "POST");
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            if (data[0].indexOf('Pending order for same user for similar request exists') != -1) {
                var oldOrderId = parseInt(data[0].split('=')[1]);
                var url = EXPLORE.urlHelper.order + oldOrderId + '/';
                var response = ApiRequest.responseWithCredentails(url);
                response.success(function(data, status) {
                    ga('send', {
                        hitType: 'event',
                        eventCategory: 'Success',
                        eventAction: url
                    });
                    deferred.resolve(data);
                }).error(function(data) {
                    //Error
                    ga('send', {
                        hitType: 'event',
                        eventCategory: 'Failure',
                        eventAction: url,
                        eventLabel: GetJSONstringfyifNeeded(data)
                    });
                    deferred.resolve(data);
                });
            } else if (data[0])
                deferred.resolve(data[0]);
            else
                deferred.resolve(false);
        });
        return deferred.promise;
    }

    var orderDelete = function(url) {
        var deferred = $q.defer();
        var params = {};
        var response = ApiRequest.responseWithMethodHttp(url, params, "DELETE");
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            if (data[0] == "An existing Love for the given Property already exists, for this User")
                deferred.resolve(true);
            else
                deferred.resolve(false);
        });
        return deferred.promise;
    }

    var orderCancel = function(url) {
        var deferred = $q.defer();
        var params = {};
        var response = ApiRequest.responseWithMethodHttp(url + 'cancel/', params, "POST");
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(true);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            if (data[0] == "An existing Love for the given Property already exists, for this User")
                deferred.resolve(true);
            else
                deferred.resolve(data[0]);
        });
        return deferred.promise;
    }

    var orderAddPaymentId = function(params, url) {
        var deferred = $q.defer();

        var response = ApiRequest.responseWithMethodHttp(url, params, "PUT");
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });
        return deferred.promise;
    }

    var getValueFromUrl = function(getUrl) {
        var deferred = $q.defer();
        var url = getUrl;
        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var getValueFromUrlWithKey = function(getUrl) {
        var deferred = $q.defer();
        var url = getUrl;
        var response = ApiRequest.responseWithCredentails(url);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: url
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });
        return deferred.promise;
    }



    var cancellation_policy = function() {
        var deferred = $q.defer();
        var response = ApiRequest.responseWithCredentails(EXPLORE.urlHelper.cancellation_policy);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: 'Cancellation policy'
            });
            deferred.resolve(data.results);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: 'Cancellation policy',
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }
    var getCancellationPolicy = function(name) {
        var deferred = $q.defer();
        var response = ApiRequest.responseWithCredentails(EXPLORE.urlHelper.cancellation_policy + '?name=' + name);
        response.success(function(data, status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Success',
                eventAction: 'Cancellation policy'
            });
            deferred.resolve(data);
        }).error(function(data,status) {
            ga('send', {
                hitType: 'event',
                eventCategory: 'Failure',
                eventAction: url,
                eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(false);
        });

        return deferred.promise;
    }

    var changePassword = function (password) {
        var deferred = $q.defer();
        var url = EXPLORE.urlHelper.users + 'change_password/';
        var params = {
            "old_password": password.old
            , "new_password1": password.new
            , "new_password2": password.confirm
        };
        var response = ApiRequest.responseWithMethodHttp(url, params, "POST");
        response.success(function (data, status) {
            ga('send', {
                hitType: 'event'
                , eventCategory: 'Success'
                , eventAction: url
            });
            deferred.resolve(true);
        }).error(function (data,status) {
            //Error
            ga('send', {
                hitType: 'event'
                , eventCategory: 'Failure'
                , eventAction: url
                , eventLabel: GetJSONstringfyifNeeded(data)
            });
            if (status == 403) {
                clearStorageAndReload();;
            }
            deferred.resolve(data);
        });
        return deferred.promise;
    }

    var fetchAll = function (arr, url, onFetch, afterFetch) {
        var promise = getValueFromUrl(url);
        promise.then(function (resp) {
            if (typeof resp === 'object') {
                onFetch(resp.results);

                if (resp.next) {
                    fetchAll(arr, resp.next, onFetch, afterFetch);
                } else {
                    afterFetch && afterFetch();
                }
            }
        });
    }

    return {
        whoami: whoami
        , getAppConfig: getAppConfig
        , getGroups: getGroups
        , joinGroup: joinGroup
        , getPendingGroupRequests: getPendingGroupRequests
        , getAllGroups: getAllGroups
        , getMyLoveListing: getMyLoveListing
        , getLoveWithGroupName: getLoveWithGroupName
        , getMyListing: getMyListing
        , getPropertyWithId: getPropertyWithId
        , getPropertyWithCode: getPropertyWithCode
        , getPropertyWithGroupName: getPropertyWithGroupName
        , getCommunityWithName: getCommunityWithName
        , getMyExperienceListing: getMyExperienceListing
        , getExperienceById: getExperienceById
        , getExperienceByCode: getExperienceByCode
        , getMyOrders: getMyOrders
        , getMyOrderById: getMyOrderById
        , getLoveById: getLoveById
        , updateReview: updateReview
        , addReview: addReview
        , addExperienceReview: addExperienceReview
        , getMyBooking: getMyBooking
        , getAllLoveProperty: getAllLoveProperty
        , getMyBookingById: getMyBookingById
        , getMyExperienceBooking: getMyExperienceBooking
        , getMyExperienceBookingById: getMyExperienceBookingById
        , getReviewOfUser: getReviewOfUser
        , getReviewForProperty: getReviewForProperty
        , getReviewForExperience: getReviewForExperience
        , getCity: getCity
        , loveProperty: loveProperty
        , loveDelete: loveDelete
        , getCouponDetails: getCouponDetails
        , orderSend: orderSend
        , orderDelete: orderDelete
        , orderCancel: orderCancel
        , orderAddPaymentId: orderAddPaymentId
        , checkAvailableProperty: checkAvailableProperty
        , getValueFromUrl: getValueFromUrl
        , getValueFromUrlWithKey: getValueFromUrlWithKey
        , cancellation_policy: cancellation_policy
        , getCancellationPolicy: getCancellationPolicy
        , changePassword: changePassword
        , fetchAll: fetchAll
    }
}]);
