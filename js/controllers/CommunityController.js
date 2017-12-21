var moment = require('moment');

angular.module('explore').controller('CommunityController', ["$scope", "$routeParams", "dataService", "ApiRequest", "$location", "$rootScope", "NgMap", "$compile", "$timeout", "$filter", "allSettled", "$q", "getFormattedSrcset", "titleService", "descriptionService", "search", "$sce",
    function($scope, $routeParams, dataService, ApiRequest, $location, $rootScope, NgMap, $compile, $timeout, $filter, allSettled, $q, getFormattedSrcset, titleService, descriptionService, search, $sce) {

    $scope.isHomePage = false;
    $scope.showLoadingIcon = true;
    $scope.showLoadingIconChanges = false;
    $scope.hideJoinButton = false;
    $scope.ifNotMember = false;
    $scope.isPendingRequest = false;
    $scope.community = {};
    $scope.viewType = 1;
    $scope.allUsers = [];
    $scope.topMembers = [];
    $scope.listing = [];
    $scope.totalListing = [];
    $scope.filter = {};
    $scope.filter.guest = 1;
    $scope.getFormattedSrcset = getFormattedSrcset;
    var loading = [];

    ga('send', 'pageview', {
        'page': window.location.host + window.location.pathname + window.location.hash,
        'title': 'Community page'
    });

    $scope.minStartDate = $filter('date')(new Date(), 'yyyy/MM/dd');
    $scope.minEndDate = $filter('date')(new Date(), 'yyyy/MM/dd');

    var proConfig = dataService.getAppConfig();
    proConfig.then(function(value) {
        $scope.configs = value.default_configuration;
        $scope.getFooterCities(value.supported_cities);
    });

    $scope.$watch('filter.selectedCheckIN', function(newValue) {
        if (newValue) {
            $scope.minEndDate = $filter('date')(new Date(newValue), 'yyyy/MM/dd');
        }
    });

    $scope.cities = []; // for city
    $scope.setCityFilter = function()
    {
        if($scope.filter.city)
            {
                $scope.cities = GetJSONifNeeded(window.localStorage[$routeParams.name+'_city']);
            }
        else
            {
                $scope.cities = [];
                angular.forEach($scope.totalListing,function(val,key){
                    var flag = 0;
                    angular.forEach($scope.cities,function(v,k){
                      if(v.city == val.city)
                          flag = 1;
                    });
                    if(flag == 0)
                        {
                            var city = {};
                            city.city = val.city;
                            city.state = val.state;
                            $scope.cities.push(city);
                        }
                });

                $scope.cities.sort(function (a, b) {
                    return a.city.toLowerCase() > b.city.toLowerCase() ? 1 : a.city < b.city ? -1 : 0;
                });

                window.localStorage[$routeParams.name+'_city'] = GetJSONstringfyifNeeded($scope.cities);
            }
    }

    $scope.location = $location;
    $scope.$watch('location.search()', function() {
        $scope.filter.city = ($location.search()).city;
        $scope.filter.state = ($location.search()).state;
        $scope.filter.view = ($location.search()).view;
        $scope.filter.sortByPrice = $location.search().sort_by ?
                                    $location.search().sort_by : '-daily_price';

        if($scope.filter.view)
            $scope.filter.view = $scope.filter.view.toLowerCase();
        $scope.filter.city_state = "";
        if ($scope.filter.city)
            $scope.filter.city_state = $scope.filter.city;
        if ($scope.filter.state) {
            if ($scope.filter.city_state != "") $scope.filter.city_state += ", ";
            $scope.filter.city_state += $scope.filter.state;
        }
        if (($location.search()).guest)
            $scope.filter.guest = ($location.search()).guest;
        $scope.filter.check_in = ($location.search()).check_in;
        $scope.filter.check_out = ($location.search()).check_out;
        if ($scope.filter.check_in)
            $scope.filter.show_check_in = $filter('date')(moment($scope.filter.check_in, 'YYYY-MM-DD').toDate(), 'dd/MM/yyyy');
        if ($scope.filter.check_out)
            $scope.filter.show_check_out = $filter('date')(moment($scope.filter.check_out, 'YYYY-MM-DD').toDate(), 'dd/MM/yyyy');
        window.eltInit($('*[data-init]').toArray());
        $scope.setCityFilter();
    }, true);

    $scope.$watch('filter.sortByPrice', function () {
        $scope.prefix = 'community';
        search.search($scope);
    });

    $scope.getValuesOfGroup = function(name) {
        var promise = dataService.getCommunityWithName(name);
        return promise.then(function(value) {
            $scope.community = {};
            if (typeof value === 'object') {
                $scope.community = value;

                var pageTitle = $scope.community.name.toLowerCase().indexOf('community') === -1 ?
                    $scope.community.name + ' Community' : $scope.community.name;
                titleService.setTitle(pageTitle, $scope);
                descriptionService.setDescription($scope.community.information, $scope);

                // set data for social sharing widgets
                $scope.fbIframeUrl = $sce.trustAsResourceUrl(
                    'https://www.facebook.com/plugins/share_button.php?href=' +
                    encodeURIComponent($location.$$absUrl) +
                    '&layout=button&size=small&mobile_iframe=true&width=59&height=20&appId'
                );
                $scope.encodedUrl = encodeURIComponent($location.$$absUrl);

                $scope.community.information = $scope.community.information.replace(/\n/g, "<br/>");
                $scope.getDetailsOfManagers($scope.community.group_admins);
                $scope.getPropertyOfThisGroup();
                var countCommunityMemberLoaded = 0;
                for (var i = 0; i < value.members.length ; i++) {
                     if ($scope.allUsers.indexOf(value.members[i]) === -1) {
                        $scope.allUsers[value.members[i]] = "";
                        countCommunityMemberLoaded++;
                        var promise = dataService.getValueFromUrl(value.members[i]);
                        promise.then(function(res) {
                            $scope.allUsers[res.url] = res;
                        });

                        if (countCommunityMemberLoaded > 8) {
                            break;
                        }
                    }
                 }
            } else {
                return $q.reject();
            }
        });
    }

    loading.push($scope.getValuesOfGroup($routeParams.name));

    $scope.getPendingRequest = function(name)
    {
        var promise = dataService.getPendingGroupRequests();
        return promise.then(function(value) {
            angular.forEach(value.results,function(val,key){
               if(val.group_details.name && val.group_details.name.toLowerCase() == name.toLowerCase())
                   {
                       $scope.isPendingRequest = true;
                   }
            });
        });
    }

    if ($rootScope.alreadyLogin === 1) {
        loading.push($scope.getPendingRequest($routeParams.name));
    }

    var allLoaded = false;
    allSettled(loading).then(function() {
        allLoaded = true;
    });

    $scope.shouldShowJoin = function () {
        if ($scope.alreadyLogin == 0) {
            return true;
        } else if (allLoaded && $rootScope.userDetails) {
            return ($rootScope.userDetails.groups_joined.indexOf($scope.community.name) == -1
                && !$scope.hideJoinButton && $scope.isPendingRequest == false);
        }
        return false;
    };

    $scope.getDetailsOfManagers = function(groupAdmins) {
        var countCommunityAdminLoaded = 0;
        for (var i = 0; i < groupAdmins.length; i++) {
            if ($scope.allUsers.indexOf(groupAdmins[i]) === -1) {
                $scope.allUsers[groupAdmins[i]] = "";
                countCommunityAdminLoaded++;
                var promise = dataService.getValueFromUrl(groupAdmins[i]);
                promise.then(function(value) {
                    $scope.allUsers[value.url] = value;
                });
                if (countCommunityAdminLoaded > 2) {
                    break;
                }
            }
        }
    }


    $scope.getUserInfo = function(url) {
        if ($scope.allUsers.indexOf(url) === -1) {
            var promise = dataService.getValueFromUrl(url);
            promise.then(function(value) {
                $scope.allUsers[value.url] = value;
            });
        }
    }

    $scope.getPropertyOfThisGroup = function() {
        $scope.totalListing = [];

        if ($rootScope.alreadyLogin == 1) {
            // love property
            var promise = dataService.getLoveWithGroupName($scope.community.name,$scope.filter);
            promise.then(function(value) {
                if (typeof value == 'object') {
                    angular.forEach(value.results, function(v, k) {
                        if (v.property_details.category.indexOf($scope.community.name) != -1)
                            $scope.totalListing.push(v.property_details);
                    });
                    $scope.setCityFilter();
                    if (value.next) {
                        $scope.getValueFromUrl(value.next);
                    }
                    $scope.loadMoreProperty();
                } else {
                    console.log('error');
                }
            });
        }
        var promise = dataService.getPropertyWithGroupName($scope.community.name,$scope.filter);
        promise.then(function(value) {
            if (typeof value == 'object') {
                $scope.count = value.count;
                angular.forEach(value.results, function(v, k) {
                    $scope.totalListing.push(v);
                });
                $scope.setCityFilter();
                if ($scope.totalListing.length == 0) {
                    $scope.ifNotMember = true;
                } else {
                    $scope.ifNotMember = false;
                }
                if ($scope.userDetails && $scope.userDetails.groups_joined.indexOf($scope.community.name) != -1) {
                    $scope.ifNotMember = false;
                }
                $scope.nextPropertyUrl = value.next;
                $scope.loadMoreProperty();
                if($scope.filter.view == 'day')
                    $scope.changeView(3);
                else if($scope.filter.view == 'map')
                    $scope.changeView(2);
                else
                    $scope.changeView(1);
            } else {
                console.log('error');
            }
        });
    }

    var loadingProperties = false;
    $scope.nextPropertyUrl = null;
    $scope.getValueFromUrl = function(url) {
        loadingProperties = true;
        var promise = dataService.getValueFromUrlWithKey(url);
        promise.then(function(value) {
            loadingProperties = false;
            if (typeof value == 'object') {
                if ($scope.totalListing.length > 1) {
                    angular.forEach(value.results, function(val, k) {
                        $scope.totalListing.push(val);
                    });
                    $scope.setCityFilter();
                    if (value.next) {
                        $scope.nextPropertyUrl = value.next;
                    } else {
                        $scope.nextPropertyUrl = null;
                    }
                    $scope.loadMoreProperty();
                }
            } else {
                console.log('error');
            }

            if ($scope.doLoadMoreAfterFetch) {
                $scope.loadMoreProperty();
                $scope.doLoadMoreAfterFetch = false;
            }
        });
    }

    $scope.goToPropertyDetail = function(code) {
        $rootScope.previous_page = $location.$$url;
        $location.url("/listing/" + code);
    }

    function getFilterView(val) {
        if (val === 3) {
            return 'day';
        }
        if (val === 2) {
            return 'map';
        }
        return '';
    }

    $scope.changeView = function(val) {
        $scope.viewType = val;
        $scope.filter.view = getFilterView(val);
        window.eltInit($('*[data-init]').toArray());
        $timeout(function() {
            window.eltInit($('*[data-init]').toArray());
        }, 1000);
        if (val == 2) {
            $scope.showListingsOnMap();
        }

        if (loadingProperties) {
            $scope.doLoadMoreAfterFetch = true;
        } else {
            $scope.loadMoreProperty();
        }
    }

    $scope.loadMoreProperty = function() {

        var minMumLoadProperty = 6;
        var last = $scope.listing.length ? $scope.listing.length : 0;
        minMumLoadProperty = $scope.totalListing.length - $scope.listing.length > 6 ? 6 : $scope.totalListing.length - $scope.listing.length;
        if ($scope.listing.length < $scope.totalListing.length) {
            for (var i = last; i < last + minMumLoadProperty; i++) {
                $scope.listing.push($scope.totalListing[i]);
                $scope.getUserInfo($scope.totalListing[i].owner);
            }
            if ($scope.listing) {
                $scope.dayLounges = $filter('filter')($scope.listing, function(property) {
                    if (property && property.config && property.config['day_lounge'])
                        return property.config['day_lounge'] === 'true';
                    else
                        return false;
                });
                $scope.propertList = $filter('filter')($scope.listing, function(property) {
                    if (property && property.config && property.config['day_lounge'])
                        return property.config['day_lounge'] !== 'true';
                    else
                        return true;
                });
                if (($scope.propertList.length < 6 || $scope.dayLounges.length < 6) && $scope.totalListing.length > $scope.propertList.length + $scope.dayLounges.length)
                    $scope.loadMoreProperty();
            }
        }

        // show loading icon untill all properties are loaded
        if ($scope.listing.length === $scope.count) {
            $scope.showLoadingIcon = false;
        } else if ($scope.nextPropertyUrl && !loadingProperties) {
            $scope.getValueFromUrl($scope.nextPropertyUrl);
        } else {
            $scope.doLoadMoreAfterFetch = true;
        }

        if ($scope.viewType == 2 && minMumLoadProperty != 0) {
            $scope.showListingsOnMap();
        }
        window.eltInit($('*[data-init]').toArray());
    }

    $scope.showListingsOnMap = function() {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < $scope.listing.length; i++) {
            var latlng = new google.maps.LatLng($scope.listing[i].latitude, $scope.listing[i].longitude);
            bounds.extend(latlng)
        }
        NgMap.getMap().then(function(map) {
            $scope.map = map;
            angular.forEach($scope.markers, function(marker, key) {
                marker.setMap(null);
            });
            $scope.markers = [];
            var bounds = new google.maps.LatLngBounds();
            var pos;
            angular.forEach($scope.totalListing, function(val, key) {
                if (val.latitude && val.longitude) {
                    createMarker(val);
                    pos = new google.maps.LatLng(val.latitude, val.longitude);
                    bounds.extend(pos);
                }
            });
            if (pos)
                $scope.map.fitBounds(bounds);

            var listener = google.maps.event.addListener($scope.map, "idle", function() {
                if ($scope.map.getZoom() > 15) $scope.map.setZoom(15);
                google.maps.event.removeListener(listener);
            });

            window.eltInit($('*[data-init]').toArray());
        });
        window.eltInit($('*[data-init]').toArray());
    }

    $scope.joinGroup = function() {
        if ($rootScope.alreadyLogin) {
            if ($scope.checkProfileData()) {
                $scope.showMessage("Please mention why/how you satisfy the join criteria for the club so the admin can accept your request", function(inputValue, linkedInUrl, facebookUrl) {
                    if (inputValue === false)
                        return false;
                    if (inputValue !== "") {
                        join_message = inputValue;
                        if (linkedInUrl){
                            join_message = join_message + " LinkedIn:" + linkedInUrl;
                        }
                        if (facebookUrl){
                            join_message = join_message + " Facebook:" + facebookUrl;
                        }
                        var promise = dataService.joinGroup($scope.community.url, join_message);
                        promise.then(function(value) {
                            if (typeof value == 'object') {
                                if (value.state == "NOTIFICATION_SENT") {
                                    $scope.hideJoinButton = true;
                                    $scope.showMessage('Notification sent to group admin.');
                                } else if (value.state == "ACCEPTED") {
                                    $scope.getUserDetails();
                                    $scope.hideJoinButton = true;
                                    $scope.showMessage('Now you are member of group.');
                                } else
                                    $scope.showMessage(value[0]);
                            } else {
                                console.log(value)
                            }
                            $scope.getPendingRequest($routeParams.name);
                        });
                    }
                }, true, true);
            }
        } else {
            $scope.doLogin();
        }
    }

    $scope.userDetails = $rootScope.userDetails;
    // show popup if data is not complete
    $scope.checkProfileData = function() {
        $scope.userDetails = $rootScope.userDetails;
        if ($scope.userDetails.email) {
            var flag = 0;
            if (!$scope.userDetails.details.phone_number || $scope.userDetails.details.phone_number == "null" || $scope.userDetails.details.phone_number == null) {
                flag = 1;
            }
            if (!$scope.userDetails.details.about || $scope.userDetails.details.about.trim() == "") {
                flag = 1;
            }
            if (!$scope.userDetails.picture && (!$scope.userDetails.social_profile_picture || $scope.userDetails.social_profile_picture.indexOf('profile_images/default-user.jpg') !== -1)) {
                flag = 1;
            }
            if ($scope.userDetails.details.about) {
                $scope.userDetails.details.about = $scope.userDetails.details.about ? String($scope.userDetails.details.about).replace(/<[^>]+>/gm, '') : '';
            }
            if (flag == 1) {
                $rootScope.callnextFunctionAfterSave = $scope.joinGroup;
                // disable check until we fix modal
                // $('#extrainfo-modal').addClass('open');
                return false;
            } else {
                return true;
            }
        }
    }

    $scope.goToTopMembers = function() {
        $location.url("/topmember/" + $routeParams.name);
    }
    $scope.goToCommunityAdmins = function() {
        $location.url("/communityadmin/" + $routeParams.name);
    }


    $scope.markers = [];
    angular.forEach($scope.markers, function(marker, key) {
        marker.setMap(null);
    });

    var infoWindow = new google.maps.InfoWindow();

    var createMarker = function(info) {
        var marker = new google.maps.Marker({
            map: $scope.map,
            position: new google.maps.LatLng(info.latitude, info.longitude),
            title: info.caption
        });

        marker.content = '<ul class="simple-property-list">' + '<li class="spl-item" >' + '<div class="spl-image" style="width:350px; cursor:pointer;" ng-click="goToPropertyDetail(\'' + info.code + '\')" >' + '<img style="height:250px;width:350px;" src="' + info.images[0].image + '" alt="">' + '<div class="summary">' + '<div class="place" style="float:right" >₹ ' + info.daily_price + '<div class="dates">onwards</div> </div>' + '<div class="place">' + info.caption + '</div>' + '<div class="dates">' + info.city + ' , ' + info.state + '</div>' + '</div>' + '</div>' + '</div>' + '</div>';
        google.maps.event.addListener(marker, 'click', function() {

            $scope.showImage = info.showImageNumber;
            var html = $compile(marker.content)($scope);
            infoWindow.setContent(html[0]);
            infoWindow.open($scope.map, marker);
        });
        $scope.markers[info.id] = (marker);
    }

    $scope.$on('$destroy', function() {
        angular.forEach($scope.markers, function(marker, key) {
            marker.setMap(null);
        });
    });

    $scope.openInfoWindow = function(e, selectedMarker) {
        e.preventDefault();
        google.maps.event.trigger(selectedMarker, 'click');
    }

    $scope.$watch('filter.show_check_in',function(){
        $scope.filter.show_check_out = $('#check-out').val();
    });
}]);
