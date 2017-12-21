angular.module('explore').controller('CommunityAdminController', ["$scope", "$location", "dataService", "$rootScope", "$filter", "$routeParams", "$timeout", "titleService", "descriptionService",
    function($scope, $location, dataService, $rootScope, $filter, $routeParams, $timeout, titleService, descriptionService) {
    $scope.isHomePage = false;
    $scope.showLoadingIcon = true;
    $scope.showLoadingIconChanges = false;
    $scope.members = [];
    $scope.totalMembers = [];
    $scope.allUsers = [];
    
    ga('send', 'pageview',{
      'page':window.location.host + window.location.pathname+window.location.hash,
      'title':'Top member page'
    });
    
    $scope.getValuesOfGroup = function (name) {
        var promise = dataService.getCommunityWithName(name);
        promise.then(function (value) {
            $scope.community = {};
            $scope.showLoadingIconChanges = true;
            if (typeof value === 'object') {
                $scope.community = value;
                console.log($scope.community);
                $scope.totalMembers = value.group_admins;
                $scope.loadMoreMembers();
            } else {
                console.log('error');
            }
        });
    }

    titleService.setTitle($routeParams.name + ' | Admin', $scope);
    descriptionService.setDescription('Admin for the community ' + $routeParams.name, $scope);

    $scope.getValuesOfGroup($routeParams.name);

    $scope.loadMoreMembers = function() {
        var minMumLoadProperty = 12;
        var last = $scope.members.length ? $scope.members.length : 0;
        minMumLoadProperty = $scope.totalMembers.length - $scope.members.length > minMumLoadProperty ? minMumLoadProperty : $scope.totalMembers.length - $scope.members.length;
        if ($scope.members.length < $scope.totalMembers.length) {
            for (var i = last; i < last + minMumLoadProperty; i++) {
                $scope.members.push($scope.totalMembers[i]);
                if ($scope.allUsers.indexOf($scope.totalMembers[i]) === -1) {
                        $scope.allUsers[$scope.totalMembers[i]] = "";               
                        var promise = dataService.getValueFromUrl($scope.totalMembers[i]);
                        promise.then(function (res) {                            
                            $scope.allUsers[res.url] = res;
                        });
                    }
            }
        }        
        if ($scope.totalMembers.length == $scope.members.length && $scope.showLoadingIconChanges)
            $scope.showLoadingIcon = false;
    }
    window.eltInit($('*[data-init]').toArray());
    
    $timeout(function(){window.eltInit($('*[data-init]').toArray())},1000);
    
}]);
