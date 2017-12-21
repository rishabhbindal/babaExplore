var head = document.getElementsByTagName('head')[0];

angular.module('explore').service('descriptionService', ['$rootScope', function ($rootScope) {

    function set(description) {

        removeDescription();

        var meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;

        head.appendChild(meta);
    }

    function removeDescription() {

        var desc = head.querySelector('meta[name="description"]');

        if (desc) {
            head.removeChild(desc);
        }
    }

    return {
        setDescription: function (description,  scope) {

            description = description.replace('"', '\'');

            set(description);

            scope.$on('$destroy', removeDescription);
        },
    }
}]);
