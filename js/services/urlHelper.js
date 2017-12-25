var moment = require('moment');

angular.module('explore').service('urlHelper',
    [function() {
        function buildSearchPath(filter) {
            var path = [];
            var filterMap = {
                'city': 'city',
                'state': 'state',
                'check_in': 'show_check_in',
                'check_out': 'show_check_out',
                'guest': 'guest',
                'sort_by': 'sortByPrice',
                view: 'view',
            };

            function dateFormatter(dateString) {
                return moment(dateString, 'DDMMYYYY').format('YYYY-MM-DD')
            }

            var formatter = {
                'check_in': dateFormatter,
                'check_out': dateFormatter
            }

            angular.forEach(filterMap, function (val, key) {
                if (filter[val]) {
                    var value = filter[val];
                    if (formatter[key]) {
                        value = formatter[key](value);
                    }
                    path.push(key + '=' + value);
                }
            });

            return path.join('&');
        }

        return {
            buildSearchPath: buildSearchPath
        };
    }]);
