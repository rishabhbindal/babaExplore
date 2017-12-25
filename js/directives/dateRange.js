angular.module('explore').directive('dateRange',
	['dataService', function (dataService) {
	return {
		restrict: 'E',
		templateUrl: 'date-range.html',
		scope: {
			filter: '='
		},
		link: function (scope, element) {

			function initDatePicker($el, advanceBookingDays, validationDate, lastDate) {
				return $el.fdatepicker({
					format: 'dd/mm/yyyy',
					weekStart: 1,
					onRender: function(date) {
						function isInvalid() {
							return date.valueOf() <= validationDate.valueOf();
						}

						if (advanceBookingDays) {
							return isInvalid() ? 'disabled' : date.valueOf() >= lastDate.valueOf() ? 'disabled' : '';
						} else {
							return isInvalid() ? 'disabled' : '';
						}
					}
				});
			}

			function initDateRange(advanceBookingDays, checkInDate, checkOutDate) {
				var nowTemp = new Date();
				var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
				var lastDate = now.addDays(advanceBookingDays);

				var $ci = element.find('input[name=check-in]');
				var $co = element.find('input[name=check-out]');

				var lastDate = now.addDays(advanceBookingDays);
				var checkin, checkout;

				checkin = initDatePicker($ci, advanceBookingDays, now, lastDate);
				checkin = checkin.on('changeDate', function(ev) {
					if (checkout && ev.date.valueOf() >= checkout.date.valueOf()) {
						var newDate = new Date(ev.date);
						newDate.setDate(newDate.getDate() + 1);
						checkout.update(newDate);
					}
					checkin.hide();
					$co.focus();
				}).data('datepicker');

				checkout = initDatePicker($co, advanceBookingDays, checkin.date, lastDate);
				checkout = checkout.on('changeDate', function(ev) {
					checkout.hide();
				}).data('datepicker');

				if (checkInDate) {
					var checkInDate = moment(checkInDate, 'DD/MM/YYYY').toDate();
					checkin.update(checkInDate);
				}
				if (checkOutDate) {
					var checkOutDate = moment(checkOutDate, 'DD/MM/YYYY').toDate();
					checkout.update(checkOutDate);
				}
			}

			var proConfig = dataService.getAppConfig();
			proConfig.then(function(value) {
				initDateRange(parseInt(value.default_configuration.advance_booking_days));
			});

			scope.resetDate = function (id) {
				element.find('#' + id).val('');
				if (id === 'check-in') {
					scope.filter.show_check_in = "";    
				} else {
					scope.filter.show_check_out = "";
				}
			}
		}
	};
}]);
