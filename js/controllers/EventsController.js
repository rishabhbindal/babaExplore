angular.module('explore').controller('EventsController', ['$scope', '$http', 'titleService',
    "descriptionService", 'dataService', "videoEmbedCode", '$timeout',
    function ($scope, $http, titleService, descriptionService, dataService, videoEmbedCode,
        $timeout) {
    $scope.isHomePage = false;

    titleService.setTitle('All Events | Explore Life Traveling', $scope);
    descriptionService.setDescription('Explore the exclusive events available on Explore Life Traveling. Get a chance to experience everything, from startup tours to fine dining experiences.', $scope);

    $scope.activeEventsLoaded = false;
    $scope.archivedEventsLoaded = false;

    $scope.showActive = true;

    var loadingActive = false;
    var loadingArchived = false;

    $scope.activeEvents = [];
    $scope.archivedEvents = [];

    ga('send', 'pageview', {
        page: window.location.host + window.location.pathname + window.location.hash,
        title: 'Events page',
    });

    function onFetchingActiveEvents(events) {
        $scope.activeEvents = $scope.activeEvents.concat(events);
        if (!$scope.activeEvents.length) {
            $scope.noActiveEvents = true;
            showArchived();
        }
    }

    function afterFetchingActiveEvents() {
        $scope.activeEventsLoaded = true;
    }

    dataService.fetchAll($scope.activeEvents, EXPLORE.urlHelper.event + '?status=ACTIVE',
            onFetchingActiveEvents, afterFetchingActiveEvents);

    function onFetchingArchivedEvents(events) {
        $scope.archivedEvents = $scope.archivedEvents.concat(events);
        if (!$scope.archivedEvents.length) {
            $scope.noArchivedEvents = true;
        }
    }

    function afterFetchingArchivedEvents() {
        $scope.archivedEventsLoaded = true;
    }
    dataService.fetchAll($scope.archivedEvents, EXPLORE.urlHelper.event + '?status=ARCHIVED',
        onFetchingArchivedEvents, afterFetchingArchivedEvents);

    function showArchived() {
        $scope.showActive = false;
    }

    $scope.addIframe = function (event) {
        $timeout(function() {
            var id = event.url.split('/')[event.url.split('/').length - 2];
            $('#id' + id).html(videoEmbedCode.get(event.videos[0].external_video_link,
                '" style="width: 33.333333%; height: 50%;"'));
        }, 100);
    };

    window.eltInit($('*[data-init]').toArray());
}]);
