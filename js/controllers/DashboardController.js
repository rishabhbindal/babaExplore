var getToken = require('../utils.js').getToken;
var EXPLORE = require('../utils.js').EXPLORE;

angular.module('explore').controller('DashboardController', ["$scope", "$routeParams", "dataService", "ApiRequest", "$location", "$rootScope", "homePageService", "$http", "$rootScope", "$timeout", "titleService", "descriptionService", "loginService",
    function ($scope, $routeParams, dataService, ApiRequest, $location, $rootScope, homePageService, $http, $rootScope, $timeout, titleService, descriptionService, loginService) {
    $scope.isHomePage = false;
    $scope.showNoBooking = false;
    $scope.loading = {};
    $scope.loading.imageUploading = false;
    $scope.hostProps = [];
    $scope.selectedProp = {};
    $scope.date = {};
    $scope.guest = {
        details: {}
    };

    titleService.setTitle($scope.userDetails.full_name + ' | Explore Life Traveling', $scope);
    descriptionService.setDescription('Dashboard for user ' + $scope.userDetails.full_name, $scope);

    ga('send', 'pageview', {
        'page': window.location.host + window.location.pathname + window.location.hash
        , 'title': 'User dashboard page'
    });

    $scope.allGroups = [];
    $scope.getDetailOfGroups = function (group) {
        var promise = homePageService.getGroupData(group);
        promise.then(function (value) {
            if (value.count) {
                value = value.results[0];
                $scope.allGroups[value.name] = (value);
            }
        });
    }

    function allowedHostOrder() {
        var allow = false;
        angular.forEach($scope.userDetails.details.description_map, function (val) {
            if (val.host_order && val.host_order.toLowerCase() === 'enabled') {
                allow = true;
            }
        });

        return allow;
    }

    $scope.userDetails = $rootScope.userDetails;
    if ($scope.userDetails && $scope.userDetails.details) {
        angular.forEach($scope.userDetails.groups_joined, function (val, k) {
            $scope.getDetailOfGroups(val);
        });
        $scope.userDetails.details.about = $scope.userDetails.details.about ? String($scope.userDetails.details.about).replace(/<[^>]+>/gm, '') : '';

        if (!$scope.userDetails.details.city || $scope.userDetails.details.city == 'null')
            $scope.userDetails.details.city = "";
        if (!$scope.userDetails.details.state || $scope.userDetails.details.state == 'null')
            $scope.userDetails.details.state = "";
        if (!$scope.userDetails.details.country || $scope.userDetails.details.country == 'null')
            $scope.userDetails.details.country = "";

        if (allowedHostOrder()) {
            $scope.allowHostOrder = true;
        }
    }

    $scope.listings = [];
    $scope.bookings = [];
    $scope.allUsers = [];
    $scope.TotalReviews = [];
    $scope.showLoader = true;
    $scope.ifReviews = false;
    $scope.type = 1;
    $scope.withoutbooking = false;
    $scope.bookingType = 1;
    $scope.password = {};
    $scope.password.old = '';
    $scope.password.new = '';
    $scope.password.confirm = '';

    $scope.$watch('alreadyLogin', function (newValue) {
        if (newValue == 0)
            $location.url('home');
    });

    $scope.getDetailOfUser = function () {
        var promise = dataService.whoami();
        promise.then(function (value) {
            $scope.userDetails = $rootScope.userDetails;
            angular.forEach($scope.userDetails.groups_joined, function (val, k) {
                $scope.getDetailOfGroups(val);
            });
            if (!$scope.userDetails.details.city || $scope.userDetails.details.city == 'null')
                $scope.userDetails.details.city = "";
            if (!$scope.userDetails.details.state || $scope.userDetails.details.state == 'null')
                $scope.userDetails.details.state = "";
            if (!$scope.userDetails.details.country || $scope.userDetails.details.country == 'null')
                $scope.userDetails.details.country = "";
        });
    }

    $scope.goToCommunity = function (name) {
        $location.path("/community/" + name);
    }

    $scope.check_avaialable_time_window;
    // Get service tax
    var proConfig = dataService.getAppConfig();
    proConfig.then(function (value) {
        if (value.default_configuration.check_avaialable_time_window) {
            $scope.check_avaialable_time_window = value.default_configuration.check_avaialable_time_window;

            if (value.default_configuration.host_order &&
                    value.default_configuration.host_order.toLowerCase() === 'enabled') {
                $scope.hostOrderEnabled = true;
            }
        }
        $scope.getFooterCities(value.supported_cities);
    });

    function changeStateName(val) {
        if (val == "ACCEPTED")
            return 'Accepted';
        else if (val == "NOTIFICATION_SENT")
            return 'Notification sent';
        else if (val == "HOST_REJECTED")
            return 'Host rejected';
        else if (val == "USER_REJECTED")
            return 'User rejected';
        else if (val == "MANAGER_REJECTED")
            return 'Manager rejected';
        else if (val == "INITIAL_STATE")
            return 'Initial';
        else return val;
    }

    $scope.getLoveProperty = function (url) {
        var promise = dataService.getAllLoveProperty();
        promise.then(function (value) {
            $scope.showLoader = false;
            $scope.listings = [];
            angular.forEach(value.results, function (v, k) {
                v.showState = changeStateName(v.state);
                $scope.listings.push(v);
            });
            $scope.checkExpiredLoved();
            if (value.next)
                $scope.getMoreLoveproperty(value.next);
            if ($scope.listings && $scope.listings.length == 0)
                $scope.withoutbooking = true;
        });
    }
    $scope.getLoveProperty();
    $scope.getMoreLoveproperty = function (url) {
        var promise = dataService.getValueFromUrl(url);
        promise.then(function (value) {
            angular.forEach(value.results, function (v, k) {
                $scope.listings.push(v);
            });
            $scope.checkExpiredLoved();
            if (value.next)
                $scope.getMoreLoveproperty(value.next);
            if ($scope.listings && $scope.listings.length == 0)
                $scope.withoutbooking = true;
        });
    }

    $scope.checkExpiredLoved = function () {
        if ($scope.check_avaialable_time_window) {
            angular.forEach($scope.listings, function (val, k) {
                if (val.state == "ACCEPTED") {
                    var time = "";
                    angular.forEach(val.quantity_map, function (v, k) {
                        time = v.time_checked;
                    });
                    var currnet = new Date().getTime();
                    var checkedTime = new Date(time).getTime();
                    if (isNaN($scope.check_avaialable_time_window))
                        $scope.check_avaialable_time_window = parseInt($scope.check_avaialable_time_window.replace(/[a-z]/g, ''));
                    checkedTime = parseInt(checkedTime) + parseInt($scope.check_avaialable_time_window * 60 * 60 * 1000);
                    // if in time frame
                    if (checkedTime > currnet) {
                        console.log('in');
                    } else if (checkedTime && currnet) {
                        $scope.listings.splice(k, 1);
                        var promise = dataService.loveDelete(val.url);
                        promise.then(function (value) {
                            console.log(value);
                        });
                    }
                }
            });
        } else {
            setTimeout(function () {
                $scope.checkExpiredLoved();
            }, 1000);

        }
    }

    $scope.deleteLove = function (url) {
        var promise = dataService.loveDelete(url);
        promise.then(function (value) {
            $scope.getLoveProperty();
        });
    }

    $scope.goToPropertyDetail = function (code) {
        $location.url('listing/' + code);
    }


    $scope.getOrders = function () {
        var promise = dataService.getMyOrders();
        promise.then(function (value) {
            angular.forEach(value.results, function (v, k) {
                $scope.showNoBooking = true;
                if (v.bookings.length) {
                    if (v.owner == $scope.userDetails.url) {
                        var rooms = 0;
                        var guests = 0;
                        angular.forEach(v.quantity_map, function (quan, kquan) {
                            angular.forEach(v.bookings[0].property.bookable_items, function (bookable, key) {
                                if (bookable.url == kquan) {
                                    rooms += quan.requested;
                                    guests += quan.requested * bookable.no_of_guests;
                                }
                            });
                        });
                        v.rooms = rooms;
                        v.guests = guests;
                        $scope.getUserInfo(v.bookings[0].property.owner);
                        $scope.bookings.push(v);
                    }
                }
            });
            $scope.showAbleBookings();
            if (value.next)
                $scope.getMoreOrders(value.next);
            $scope.showLoaderInner = false;
            if ($scope.bookings && $scope.bookings.length == 0)
                $scope.withoutbooking = true;
        });
    }
    $scope.getOrders();
    $scope.getMoreOrders = function (url) {
        var promise = dataService.getValueFromUrlWithKey(url);
        promise.then(function (value) {
            angular.forEach(value.results, function (v, k) {
                if (v.bookings.length) {
                    if (v.owner == $scope.userDetails.url) {
                        var rooms = 0;
                        var guests = 0;
                        angular.forEach(v.quantity_map, function (quan, kquan) {
                            angular.forEach(v.bookings[0].property.bookable_items, function (bookable, key) {
                                if (bookable.url == kquan) {
                                    rooms += quan.requested;
                                    guests += quan.requested * bookable.no_of_guests;
                                }
                            });
                        });
                        v.rooms = rooms;
                        v.guests = guests;
                        $scope.getUserInfo(v.bookings[0].property.owner);
                        $scope.bookings.push(v);
                    }
                }
            });
            $scope.showAbleBookings();
            if (value.next)
                $scope.getMoreOrders(value.next);
            if ($scope.bookings && $scope.bookings.length == 0)
                $scope.withoutbooking = true;
        });
    }
    $scope.showLoadingIcon = true;
    $scope.changeBookingType = function (val) {
        $scope.bookingType = val;
        $scope.showLoadingIcon = true;
        $scope.showAbleBookings();
    }

    $scope.getUserInfo = function (url) {
        if (!$scope.allUsers[url]) {
            $scope.allUsers[url] = " ";
            var promise = dataService.getValueFromUrl(url);
            promise.then(function (value) {
                $scope.allUsers[value.url] = value;
            });
        }
    }

    $scope.showOnGoingTab = false;

    $scope.closeRazorpay = function () {
        if ($scope.paymentSuccess == false) {
            $scope.orderCloseByTimeout = true;
            rzp1.close();
        }
    };

    pay = function (paymentUrl, orderDetails) {
        $scope.paymentSuccess = false;
        $scope.orderCloseByTimeout = false;

        var paymentId = paymentUrl.split('/')[paymentUrl.split('/').length - 2];

        closeTimeout = $timeout(function () {
            $scope.closeRazorpay();
        }, 20 * 60 * 1000); // close razor pay screen if it is open more than 20 mins

        var options = {
            key: 'rzp_live_s0tl4TqJp0niIm', //"rzp_test_lDLPc94665cXrV",//
            amount: Math.ceil(orderDetails.remainingAmount * 100),
            currency: 'INR',
            name: orderDetails.bookings[0].property.caption,
            description: orderDetails.bookings[0].property.caption,
            image: orderDetails.bookings[0].property.images[0].image,
            notes: {
                elt_payment_id: paymentId,
            },
            handler: function (response) {
                $scope.paymentSuccess = true;

                var params = {
                    payment_gateway: 'RAZOR_PAY',
                    receipt_information: response.razorpay_payment_id,
                };

                var promise;
                if (orderDetails.created_by === 'HOST') {
                    var orderHistory = orderDetails.history;
                    var hoStringRegex = /Url code is (.*) and hash is (.*)/g;
                    var ref, code;

                    angular.forEach(orderHistory, function (h) {
                        const res = hoStringRegex.exec(h);
                        if (!res) {
                            return;
                        }
                        ref = res[1];
                        code = res[2];
                    });

                    var payUrl = EXPLORE.urlHelper.orders_by_host + paymentId +
                        '/?ref=' + ref + '&code=' + code;

                    promise = $http({
                        url: payUrl,
                        data: JSON.stringify(params),
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json; charset=UTF-8'
                        }
                    });
                } else {
                    promise = ApiRequest.responseWithMethodHttp(paymentUrl, params, 'PUT');
                }

                promise.success(function (val) {
                    function updateOrderDetails() {
                        orderDetails.paymentRemaining = false;
                        orderDetails.amount_paid = orderDetails.amount;
                    }

                    function showPaymentSuccessMessage() {
                        function copyToRootScope() {
                            $rootScope.paymentDetails = {
                                paymentId: $scope.PaymentId,
                                date_from: orderDetails.date_from,
                                date_until: orderDetails.date_until,
                                caption: orderDetails.bookings[0].property.caption,
                                totalPrice: orderDetails.remainingAmount,
                            };
                        }
                        copyToRootScope();

                        $('#payment-success-modal').addClass("open");
                    }
                    $timeout.cancel(closeTimeout);
                    $scope.PaymentId = getIdfromUrl(val.url);
                    updateOrderDetails();
                    showPaymentSuccessMessage();
                }).error(function () {
                    ApiRequest.responseWithMethodHttp(paymentUrl, null, 'DELETE');
                });
            },
            prefill: {
                name: $scope.userDetails.full_name,
                email: $scope.userDetails.email,
                contact: $scope.userDetails.details.phone_number,
            },
            theme: {
                color: '#F37254'
            },
            modal: {
                ondismiss: function (response) {
                    $timeout.cancel(closeTimeout);
                    if (orderDetails.created_by === 'HOST') {
                        return;
                    }
                    setTimeout(function () {
                        if ($scope.paymentSuccess === false && $scope.orderCloseByTimeout === false) {
                            ApiRequest.responseWithMethodHttp(paymentUrl, null, 'DELETE');
                        }
                    }, 1000);
                }
            }
        };

        var rzp1 = new Razorpay(options);
        rzp1.open();
    };

    $scope.sendOrder = function (orderDetails) {
        var url = orderDetails.url + 'add_payment/';

        if (orderDetails.created_by === 'HOST') {
            pay(orderDetails.url, orderDetails);
            return;
        }

        var paymentPromise = ApiRequest.responseWithMethodHttp(url, null, 'POST');
        paymentPromise.success(function (order) {

            if (typeof order === 'object') {
                var paymentInfo = order.payments[0];
                orderDetails.remainingAmount = paymentInfo.amount;
                pay(paymentInfo.url, orderDetails);
            } else {
                $scope.showMessage(order);
            }

        }).error(function (errors) {
            $scope.showMessage(errors[0]);
        });
    };

    function handleRemainingPayment(order) {
        var amount = Number.parseFloat(order.amount);
        var amountPaid = Number.parseFloat(order.amount_paid);

        if (amount !== amountPaid) {
            order.remainingAmount = parseFloat(amount - amountPaid).toFixed(2);
            order.paymentRemaining = true;
            return;
        }

        order.paymentRemaining = false;
    }

    $scope.showAbleBookings = function () {
        $scope.showBookings = [];
        $scope.showLoadingIcon = true;
        angular.forEach($scope.bookings, function (val, key) {
            handleRemainingPayment(val);
            if (new Date(val.date_from).getTime() <= new Date().getTime() && new Date(val.date_until).getTime() >= new Date().getTime()) {
                $scope.showOnGoingTab = true;
            }
        });

        if ($scope.bookingType == 1) //upcoming
        {
            angular.forEach($scope.bookings, function (val, key) {
                if (new Date(val.date_from).getTime() > new Date().getTime()) {
                    handleRemainingPayment(val);
                    $scope.showBookings.push(val);
                }
            });
            $scope.showLoadingIcon = false;
        } else if ($scope.bookingType == 2) // history
        {
            angular.forEach($scope.bookings, function (val, key) {
                    handleRemainingPayment(val);
                if (new Date(val.date_until).getTime() < new Date().getTime()) {
                    $scope.showBookings.push(val);
                }
            });
            $scope.showLoadingIcon = false;
        } else if ($scope.bookingType == 3) // On going bookings
        {
            angular.forEach($scope.bookings, function (val, key) {
                handleRemainingPayment(val);
                if (new Date(val.date_from).getTime() <= new Date().getTime() && new Date(val.date_until).getTime() >= new Date().getTime())
                    $scope.showBookings.push(val);
            });
            $scope.showLoadingIcon = false;
        }

    }

    $scope.editTrue = false;
    $scope.changePasswordTrue = false;

    $scope.saveProfile = function () {
        if (!$scope.changePasswordTrue) {
            if ($scope.editTrue) {
                $scope.errorMessage = '';
                if (!$scope.userDetails.email) {
                    $scope.errorMessage = "Kindly fill email address.";
                } else if (!validateEmail($scope.userDetails.email)) {
                    $scope.errorMessage = "Kindly fill valid email address.";
                } else if (!$("#phone_number").intlTelInput("getNumber")) {
                    $scope.errorMessage = "Kindly enter valid phone number.";
                } else if (!$scope.userDetails.details.about) {
                    $scope.errorMessage = "Kindly enter about yourself.";
                } else {
                    $scope.oldDetails = $rootScope.userDetails;

                    //Telling server its just a information update and not picture update
                    delete $scope.userDetails.picture;
                    delete $scope.userDetails.social_picture;

                    if ($("#phone_number").intlTelInput("getNumber")) {
                        $scope.userDetails.details.phone_number = $("#phone_number").intlTelInput("getNumber");
                    }

                    var newUserData = {};
                    newUserData.email = $scope.userDetails.email;
                    newUserData.first_name = $scope.userDetails.first_name;
                    newUserData.last_name = $scope.userDetails.last_name;
                    newUserData.date_of_birth = $scope.userDetails.date_of_birth;
                    newUserData.details = {};
                    newUserData.details.about = $scope.userDetails.details.about;
                    newUserData.details.street_address = $scope.userDetails.details.street_address;
                    newUserData.details.city = $scope.userDetails.details.city;
                    newUserData.details.state = $scope.userDetails.details.state;
                    newUserData.details.country = $scope.userDetails.details.country;
                    newUserData.details.gender = $scope.userDetails.details.gender;
                    newUserData.details.phone_number = $scope.userDetails.details.phone_number;

                    var response = ApiRequest.responseWithMethodHttp($scope.userDetails.url, newUserData, "PUT");
                    response.success(function (data, status) {
                        $scope.getDetailOfUser();
                        $scope.editTrue = !$scope.editTrue;
                        if ($scope.oldDetails.email != $scope.userDetails.email)
                            $scope.showMessage("Verification email has been sent to the new address provided, please click on the link in the email to verify your new address and use this address to login  for future.");
                    }).error(function () {
                        $scope.showMessage("Error in update user details.");
                        //Error
                        console.log("error");
                    });
                }
            } else {
                $scope.editTrue = !$scope.editTrue;
            }
        } else {
            $scope.errorMessage = '';
            $scope.changePasswordTrue = !$scope.changePasswordTrue;
            $scope.editTrue = !$scope.editTrue;
        }
    }

    $scope.changePassword = function () {
        if (!$scope.editTrue) {
            if ($scope.changePasswordTrue) {
                $scope.errorMessage = '';
                if (!$scope.password.old) {
                    $scope.errorMessage = "Please Enter your old password";
                } else if (!$scope.password.new) {
                    $scope.errorMessage = "Please Enter your new password";
                } else if (!$scope.password.confirm) {
                    $scope.errorMessage = "Please Confirm your new password";
                } else if ($scope.password.new != $scope.password.confirm) {
                    $scope.errorMessage = "Confirm password didn't matched with new password";
                } else {
                    var updatePasswordResponse = dataService.changePassword($scope.password);
                    updatePasswordResponse.then(function (value) {
                        if (value == true) {
                            $scope.changePasswordTrue = !$scope.changePasswordTrue;
                        } else {
                            $scope.errorMessage = '';
                            if (value['old_password']) {
                                $scope.errorMessage = $scope.errorMessage + ' Old Password:' + value['old_password'];
                            }
                            if (value['new_password1']) {
                                $scope.errorMessage = $scope.errorMessage + ' New Password:' + value['new_password1'];
                            }
                            if (value['new_password2']) {
                                $scope.errorMessage = $scope.errorMessage + ' Confirm Password:' + value['new_password2'];
                            }
                        }
                    });
                }
            } else {
                $scope.changePasswordTrue = !$scope.changePasswordTrue;
            }
        } else {
            $scope.errorMessage = '';
            $scope.changePasswordTrue = !$scope.changePasswordTrue;
            $scope.editTrue = !$scope.editTrue;
        }
    }

    $scope.cancelUpdate = function () {
        $scope.errorMessage = '';
        if ($scope.changePasswordTrue) {
            $scope.changePasswordTrue = !$scope.changePasswordTrue;
        }
        if ($scope.editTrue) {
            $scope.editTrue = !$scope.editTrue;
        }

        $scope.createOrder = false;
    }

    $scope.changeImage = function () {
        $('#picture').click();
    }

    $('#picture').change('live', function () {
        $scope.saveProfilePic();
    });

    $scope.saveProfilePic = function () {

        var formData = new FormData();
        formData.append('email', $scope.userDetails.email);
        formData.append('first_name', $scope.userDetails.first_name);
        formData.append('last_name', $scope.userDetails.last_name);
        formData.append('details.city', $scope.userDetails.details.city || null);
        formData.append('details.phone_number', $scope.userDetails.details.phone_number || null);
        formData.append('details.state', $scope.userDetails.details.state || null);
        formData.append('details.country', $scope.userDetails.details.country || null);
        formData.append('details.street_address', $scope.userDetails.details.street_address || null);
        formData.append('details.gender', $scope.userDetails.details.gender || null);
        input = document.getElementById('picture');

        if (input.files[0])
            formData.append('picture', input.files[0]);

        var key = getToken();
        $scope.loading.imageUploading = true;
        $http.put($scope.userDetails.url, formData, {
            'headers': {
                "Authorization": key
                , 'Content-Type': undefined
            }
        }).success(function (data) {
            $scope.getDetailOfUser();
        }).error(function (data, status) {
            $scope.loading.imageUploading = false;
            $scope.showMessage("Error in update profile data.");
            console.log('error');
        });

    }
    $("#userImage").bind('load', function () {
        $scope.loading.imageUploading = false;
        if (!$scope.$$phase) $scope.$apply();
    });


    $scope.getReviewOfUser = function () {
        var userId = $scope.userDetails.url.split('/')[$scope.userDetails.url.split('/').length - 2];

        var promise = dataService.getReviewOfUser(userId);
        promise.then(function (value) {
            $scope.TotalReviews = [];
            angular.forEach(value.results, function (val, k) {
                if (val.author == $scope.userDetails.url) {
                    val.readonly = true;
                    $scope.TotalReviews[val.associated_order] = val;
                    angular.forEach($scope.bookings, function (booking, key) {
                        if (booking.url == val.associated_order) {
                            $scope.bookings[key].editReview = false;
                        }
                    });
                }
            });

            if (value.next)
                $scope.getMoreReview(value.next);
        });
    }
    $scope.getReviewOfUser();
    $scope.getMoreReview = function (url) {
        var promise = dataService.getValueFromUrlWithKey(url);
        promise.then(function (value) {
            angular.forEach(value.results, function (val, k) {
                if (val.author == $scope.userDetails.url) {
                    val.readonly = true;
                    $scope.TotalReviews[val.associated_order] = val;
                    angular.forEach($scope.bookings, function (booking, key) {
                        if (booking.url == val.associated_order) {
                            $scope.bookings[key].editReview = false;
                        }
                    });
                }
            });
            if (value.next)
                $scope.getMoreReview(value.next);
        });
    }

    $scope.editReview = function (booking, review) {
        booking.editReview = true;
        booking.reviewData = review;
    }

    $scope.saveReviews = [];
    $scope.submitReview = function (propertyUrl, associated_order, data, url) {
        if (url) {
            $scope.newReview = [];
            $scope.newReview.rating = {};
            $scope.newReview.rating.accuracy = 0;
            $scope.newReview.rating.communication = 0;
            $scope.newReview.rating.cleanliness = 0;
            $scope.newReview.rating.location = 0;
            $scope.newReview.rating.check_in = 0;
            $scope.newReview.rating.value = 0;
            $scope.newReview.review = data;
            $scope.newReview.author = $scope.userDetails.url;
            $scope.newReview.associated_order = associated_order;
            $scope.newReview.property = propertyUrl;
            $scope.newReview.url = url;
            var promise = dataService.updateReview($scope.newReview);
            promise.then(function (value) {
                if (value == true) {
                    $scope.showMessage('Review updated successfully.');
                    $scope.getReviewOfUser();
                } else {
                    if (value['detail']) {
                        $scope.showMessage(value['detail']);
                    } else {
                        $scope.showMessage(GetJSONstringfyifNeeded(value));
                    }
                }
            });
        } else if ($scope.saveReviews.indexOf(associated_order) == -1) {
            $scope.saveReviews.push(associated_order);
            $scope.newReview = [];
            $scope.newReview.rating = {};
            $scope.newReview.rating.accuracy = 0;
            $scope.newReview.rating.communication = 0;
            $scope.newReview.rating.cleanliness = 0;
            $scope.newReview.rating.location = 0;
            $scope.newReview.rating.check_in = 0;
            $scope.newReview.rating.value = 0;
            $scope.newReview.review = data;
            $scope.newReview.author = $scope.userDetails.url;
            $scope.newReview.associated_order = associated_order;
            $scope.newReview.property = propertyUrl;
            var promise = dataService.addReview($scope.newReview);

            promise.then(function (value) {
                if (value == true) {
                    $scope.showMessage('Review added successfully.');
                    $scope.getReviewOfUser();
                } else {
                    if (value['detail']) {
                        $scope.showMessage(value['detail']);
                    } else {
                        $scope.showMessage(GetJSONstringfyifNeeded(value));
                    }
                }
            });
        }
    }

    $scope.policy = {};
    $scope.cancelBooking = function (url) {
        var order;
        $scope.policy = {};
        angular.forEach($scope.bookings, function (val, key) {
            if (val.url == url) {
                order = val;
            }
        });
        $scope.deleteorderUrl = url;

        var promise = dataService.getCancellationPolicy(order.bookings[0].property.cancellation_policy)
        promise.then(function (value) {
            $scope.policy = value.results[0];
            $('#policy-modal').addClass("open");
        });

    }

    $scope.deleteOrder = function () {
        var promise = dataService.orderCancel($scope.deleteorderUrl)
        promise.then(function (value) {
            if (value == true) {
                $scope.showMessage("Order canceled successfully.");
                $scope.getOrders();
            } else {
                $scope.showMessage(value);
            }
        });
    }

    $scope.createGuestOrder = function () {
        $scope.createOrder = true;

        $timeout(function () {
            initialiseDatePickers();
        }, 200);

        function initialiseDatePickers() {
            setDatePicker();
            $('#guestDOB').fdatepicker({
                format: 'yyyy-mm-dd'
            });
        }
    };

    function getHostProps(url) {

        var promise = ApiRequest.responseWithCredentails(url);

        promise.then(function (response) {
            if (typeof response.data === 'object') {
                $scope.hostProps = $scope.hostProps.concat(response.data.results);

                if (response.data.next) {
                    getHostProps(response.data.next);
                }
            }
        });
    }

    if ($scope.userDetails && $scope.userDetails.details.allow_hosting) {
        getHostProps(EXPLORE.urlHelper.properties + 'owns/');
    }

    function selectProp(propUrl) {

        $scope.hostProps.some(function (prop) {
            if (prop.url === propUrl) {
                $scope.prop = prop;
                $scope.packageSelected = setPackageType(prop.bookable_items);
                return true;
            }

            return false;
        });

        function setPackageType(items) {
            return items.some(function (bookable) {
                return bookable.type.toLowerCase() === 'package';
            });
        }
    }

    $scope.$watch('selectedProp.url', function (value) {

        if (value) {
            selectProp(value);
        }
    });

    $scope.$watch('guest.username', function (value) {
        if (!value) {
            if (!$('#email').val()) {
                resetOrderDetails();
            }
        }
    });

    function guestDetailsIncorrect() {

        if (!$scope.detailsRequired) {
            return false;
        }

        if (!($scope.guest.password && $scope.guest.firstname && $scope.guest.lastname &&
                $scope.guest.date_of_birth_valid && $scope.guest.gender)) {
            $scope.showMessage('Please fill in all Guest details.')
            return true;
        }

        if ($scope.guest.username !== $scope.guest.confirmEmail) {
            $scope.showMessage('Guest Email and confirmation Guest Email do not match.');
            return true;
        }

        if ($scope.guest.password !== $scope.guest.conpassword) {
            $scope.showMessage('Guest password and Confirm password do not match.')
            return true;
        }

        if (!$scope.guest.phone_number) {
            $scope.showMessage('Please fill in Guest phone number. It should be a 10 digit number.')
            return true;
        }
    }

    $scope.promptDetails = function () {

        var url = EXPLORE.urlHelper.users + '?name=' + $scope.guest.username;

        var promise = ApiRequest.responseWithCredentails(url);

        promise.then(function (response) {
            if (response.data.results.length) {
                $scope.guest = response.data.results[0];
                $scope.guest.username = $scope.guest.confirmEmail = $scope.guest.email;
                $scope.showMessage('Guest is registered with Explore Life Traveling, you can proceed to create order for Guest.');

                $scope.guestRegistered = true;
                $scope.detailsRequired = false;
                return;
            }

            $scope.detailsRequired = true;
            $scope.showMessage('Guest is not registered with Explore Life Traveling, please fill in details to create new account for the Guest.')
        });
    }

    function formatDates() {
        $scope.from = moment($scope.date.date_from, 'DD/MM/YYYY').
            format('YYYY-MM-DD');

        $scope.until = moment($scope.date.date_until, 'DD/MM/YYYY').
            format('YYYY-MM-DD');
    }

    $scope.createUser = function () {

        if (guestDetailsIncorrect()) {
            return;
        }

        $scope.guest.terms = false;
        $scope.guest.details.phone_number = $('#guestPhoneNum').intlTelInput('getNumber');

        var promise = loginService.register($scope.guest);
        promise.then(function (data) {
            if (typeof data === 'object') {
                $scope.guest.url = data.url;
                $scope.guestRegistered = true;
                $scope.showMessage('Account created for user ' + $scope.guest.firstname + ' ' +
                    $scope.guest.lastname + ' with email id ' + $scope.guest.username);
                $scope.detailsRequired = false;
            }
        })
    };

    // reset guest and order details
    function resetOrderDetails() {
        $scope.guest = { details: {} };
        $scope.detailsRequired = false;
        $scope.selectedProp = {};
        $scope.guestRegistered = false;
        $scope.dates = {};
    }

    function incompleteOrderDetails() {
        function isbookableSelected(bookableItems) {
            if (!bookableItems) {
                return false;
            }
            return Object.values(bookableItems).some(function (bookable) { return bookable.requested });
        }
        if (!($scope.date.date_from &&
            ($scope.packageSelected || $scope.date.date_until))) {
            $scope.showMessage('Please select Check-In and Check-Out dates for the order.')
            return true;
        }

        if (!$scope.selectedProp.url || !isbookableSelected($scope.selectedProp.bookable_items)) {
            $scope.showMessage('Please select property and bookables for the order.')
            return true;
        }
    }

    $scope.order = function () {

        formatDates();

        if (incompleteOrderDetails()) {
            return;
        }

        var createOrderUrl = EXPLORE.urlHelper.order + 'create_by_host/';

        var date_until = $scope.packageSelected ? $scope.from : $scope.until;

        var params = {
            date_from: $scope.from,
            date_until: date_until,
            owner: $scope.guest.url,
            payment_gateway: 'RAZOR_PAY'
        };

        if ($scope.selectedProp.customPricing) {
            if ($scope.selectedProp.customPrice !== undefined) {
                params.cost = $scope.selectedProp.customPrice;
            }

            if ($scope.selectedProp.customDownpayment !== undefined) {
                params.downpayment_cost = $scope.selectedProp.customDownpayment;
            }
        }

        params.quantity_map = {};

        angular.forEach($scope.selectedProp.bookable_items, function (bookable, url) {
            if (bookable.requested) {
                params.quantity_map[url] = {
                    requested: bookable.requested,
                };
            }
        });

        var promise = ApiRequest.responseWithMethodHttp(createOrderUrl, params, 'POST');

        promise.then(function (response) {
            if (typeof response.data === 'object') {
                resetOrderDetails();
                copyToRootScope();
                $('#hostOrderSuccess-modal').addClass('open');

                function copyToRootScope() {
                    $rootScope.selectedProp  = {
                        from: $scope.from,
                        until: $scope.until,
                        property: response.data.caption,
                    };

                    $rootScope.selectedProp.bookable_items = [];

                    angular.forEach(response.data.quantity_map, function (bookableMap) {
                        $rootScope.selectedProp.bookable_items.push({
                            caption: bookableMap.caption,
                            requested: bookableMap.requested,
                        });
                    });
                }

            }
        });

        promise.catch(function (response) {
            if (response.data) {
                var message = '';
                angular.forEach(response.data, function (error, prop) {
                    message += (prop + ':' + error);
                });

                $scope.showMessage(message);
            }
        });
    };

}]);
