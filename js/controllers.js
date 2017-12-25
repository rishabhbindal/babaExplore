var getToken = require('./utils.js').getToken;

angular.module('explore').controller('AppController', ["$scope", "$rootScope", "$interval", "dataService", "loginService", "$location", "$filter", "$facebook", "$timeout", "ApiRequest", "$http", "$route",
    function($scope, $rootScope, $interval, dataService, loginService, $location, $filter, $facebook, $timeout, ApiRequest, $http, $route) {

        $rootScope.alreadyLogin = 0;
        $scope.userDetails = {};
        $scope.loginView = {};
        $scope.loginView.showForgot = false;
        $scope.MinimumLengthOfAbout = MinimumLengthOfAbout;

        $rootScope.defaultTitle = "Explore Life Traveling | Book the Best Homestays in India";
        $rootScope.title = $rootScope.defaultTitle;

        var EMAIL_REGEXP = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        $scope.logout = function() {
            loginService.logout();
            $rootScope.alreadyLogin = 0;
            $timeout(function() {
                console.log('calll');
                window.eltInit($('*[data-init]').toArray());
            }, 1000);
        };

        var isLoginCookieVal = document.cookie.replace(/(?:(?:^|.*;\s*)isLogin\s*\=\s*([^;]*).*$)|^.*$/, '$1');

        if (window.localStorage.isLogin === '1' || isLoginCookieVal === '1') {
            $rootScope.alreadyLogin = 1;
        }

        $scope.handleRequireAuth = function(isLogin) {
          var currentRoute = Object.values($route.routes).find(function(obj) {
              return obj.regexp.test($location.path());
          });
          if(currentRoute.requireAuth && isLogin != 1) {
            window.location.href = '/';
          }
        }

        $scope.$watch('alreadyLogin', function(newValue) {
            $scope.handleRequireAuth(newValue);
            if (newValue == 1) {
                if ($rootScope.userDetails) {
                    $scope.getUserDetails();
                    $scope.setUserDetails();
                } else {
                    var promise = dataService.whoami();
                    promise.then(function(value) {
                        $scope.setUserDetails();
                    });
                }
            } else if (newValue == 0) {
                $scope.userDetails = {};
            }
        });

        $scope.setUserDetails = function() {
            $scope.userDetails = $rootScope.userDetails;
            if ($scope.userDetails && $scope.userDetails.details
                && $scope.userDetails.details.about) {
                $scope.userDetails.details.about = $scope.userDetails.details.about ? String($scope.userDetails.details.about).replace(/<[^>]+>/gm, '') : '';
            }
            $scope.getProfileData();
        }

        $scope.getUserDetails = function() {
            promise = dataService.whoami();
            promise.then(function(userData) {
                if ($rootScope.callnextFunctionAfterSave && $rootScope.callnextFunctionAfterSave != "") {
                    $rootScope.callnextFunctionAfterSave();
                    $rootScope.callnextFunctionAfterSave = "";
                }

                if (userData && userRequiredFieldsPresent(userData)) {
                    if (!userData.social_picture && userData.social_profile_picture && !userData.social_profile_picture.endsWith("profile_images/default-user.jpg")) {
                        $http({
                            url: userData.social_profile_picture + '?height=640&width=640&redirect=0',
                        }).then(function(response) {
                            return $http({
                                url: response.data.data.url,
                                responseType: 'arraybuffer'
                            }).then(function(social_picture) {
                                social_picture = new Blob([social_picture.data], { type: 'image/png' });
                                $scope.saveProfilePic(social_picture);
                            });
                        }).catch(function(error) {
                            console.log(error);
                        });
                    }
                }
            });
        }

        if ($rootScope.userDetails) {
            redirectOnMissingData($rootScope.userDetails);
        }

        function redirectOnMissingData(userDetails) {
            if (userDetails && !$rootScope.signupFromFb && !userRequiredFieldsPresent(userDetails)) {
              // window.location.href = '/missing-details';
            }
        }

        // show popup if data is not complete
        $scope.getProfileData = function() {
            if ($rootScope.userDetails && $rootScope.userDetails.date_of_birth) {
                // populate dob_dd, dob_mm, dob_yy for usage in forms
                populateDobProps();

                function populateDobProps() {
                    var dob = $rootScope.userDetails.date_of_birth.split("-");
                    $rootScope.userDetails.dob_yyyy = parseInt(dob[0]);
                    $rootScope.userDetails.dob_mm = parseInt(dob[1]);
                    $rootScope.userDetails.dob_dd = parseInt(dob[2]);
                }
            }

            redirectOnMissingData($rootScope.userDetails);
        }

        function getMaxDigits(val, max) {
            if (typeof val === 'undefined') {
                return null;
            }

            while (val > max) {
                val = parseInt(val / 10);
            }
            return val;
        }

        $scope.checkDate = function() {
            $scope.userDetails.dob_dd = getMaxDigits($scope.userDetails.dob_dd, 31);
        };

        $scope.checkMonth = function() {
            $scope.userDetails.dob_mm = getMaxDigits($scope.userDetails.dob_mm, 12);
        };

        $scope.checkYear = function() {
            var minYear = moment().subtract(90, 'years').year();
            var maxYear = moment().year();
            $scope.userDetails.dob_yyyy = getMaxDigits($scope.userDetails.dob_yyyy, maxYear);
        };

        function resetExtrainfoCalledFromWhoami() {
            $rootScope.extrainfoCalledFromWhoami = false;
        }

        $scope.extraUserInfo = function() {
            $scope.errorMessage = '';
            $scope.userDetails.details.phone_number = $("#extrainfo_phone_number").intlTelInput("getNumber");
            date_of_birth = [$scope.userDetails.dob_dd, $scope.userDetails.dob_mm, $scope.userDetails.dob_yyyy].join('/');

            var input = document.getElementById('picture');
            if (!$scope.userDetails.email || !EMAIL_REGEXP.test($scope.userDetails.email)) {
                $scope.errorMessage = "Please enter a valid email address";
            } else if (!$scope.userDetails.details.phone_number) {
                $scope.errorMessage = "Please enter valid phone number";
            // } else if (!$scope.userDetails.details.city) {
            //     $scope.errorMessage = 'Please enter your current city';
            } else if (!$rootScope.extrainfoCalledFromWhoami && !$scope.userDetails.details.about) {
                $scope.errorMessage = 'Character field is empty'
            } else if ($scope.userDetails.details.about &&
                $scope.userDetails.details.about.length < MinimumLengthOfAbout) {
                $scope.errorMessage = ErrorMsgOnAbout;
            // } else if (!$scope.userDetails.dob_dd && !$scope.userDetails.dob_mm && !$scope.userDetails.dob_yyyy) {
            //     $scope.errorMessage = "Please fill Date of Birth";
            // } else if (!$scope.userDetails.dob_dd) {
            //     $scope.errorMessage = 'Invalid Day in Date of Birth';
            // } else if (!$scope.userDetails.dob_mm) {
            //     $scope.errorMessage = 'Invalid Month in Date of Birth';
            // } else if (!$scope.userDetails.dob_yyyy) {
            //     $scope.errorMessage = 'Invalid Year in Date of Birth, enter in yyyy format.';
            // } else if (!moment(date_of_birth, "DDMMYYY").isValid()) {
            //     $scope.errorMessage = "Wrong combination of Date and Month in Date of Birth.";
            // } else if (_calculateAge(date_of_birth) < 0) {
            //     $scope.errorMessage = "Date of Birth is in future.";
            // } else if (_calculateAge(date_of_birth) < 18) {
            //     $scope.errorMessage = "You must be at least 18 years of age.";
            // } else if (_calculateAge(date_of_birth) > 90) {
            //     $scope.errorMessage = "You must be at most 90 years of age.";
            // } else if (!$scope.userDetails.details.gender) {
            //     $scope.errorMessage = "Please select gender";
            } else if (input.files.length === 0 && !$scope.userDetails.picture && (!$scope.userDetails.social_profile_picture || $scope.userDetails.social_profile_picture.indexOf('profile_images/default-user.jpg') !== -1)) {
                $scope.errorMessage = "Please select profile image";
            } else {
                //delete $scope.userDetails.picture;

                if ($scope.userDetails.details.phone_number) {
                    $scope.userDetails.details.phone_number = $("#extrainfo_phone_number").intlTelInput("getNumber");
                }

                // var dateInput = new Date($scope.userDetails.dob_yyyy, $scope.userDetails.dob_mm - 1, $scope.userDetails.dob_dd);
                // $scope.userDetails.date_of_birth = moment(dateInput).format('YYYY-MM-DD');

                $scope.saveProfilePic();
            }
        }

        $scope.saveProfilePic = function(social_picture) {

            var formData = new FormData();
            formData.append('email', $scope.userDetails.email);
            formData.append('first_name', $scope.userDetails.first_name);
            formData.append('last_name', $scope.userDetails.last_name);

            if ($scope.userDetails.details.about) {
                formData.append('details.about', $scope.userDetails.details.about);
            }

            formData.append('details.city', $scope.userDetails.details.city || "");
            formData.append('details.phone_number', $scope.userDetails.details.phone_number || "");
            formData.append('details.state', $scope.userDetails.details.state || "");
            formData.append('details.country', $scope.userDetails.details.country || "");
            formData.append('details.street_address', $scope.userDetails.details.street_address || "");
            formData.append('details.gender', $scope.userDetails.details.gender || "");

            if ($scope.userDetails.date_of_birth) {
                formData.append('date_of_birth', $scope.userDetails.date_of_birth);
            }

            input = document.getElementById('picture');

            if (input.files[0]) {
                formData.append('picture', input.files[0]);
            }

            if (social_picture) {
                formData.append('social_picture', social_picture);
            }
            var key = getToken();
            $("#loading").show();
            $.ajax({
                type: "PUT"
                , cache: false
                , contentType: false
                , processData: false
                , data: formData
                , url: $scope.userDetails.url
                , headers: {
                    "Authorization": key
                }
                , success: function(data) {
                    $("#loading").hide();
                    $scope.getUserDetails();
                    $('.modal').removeClass('open');
                    resetExtrainfoCalledFromWhoami();
                }
                , error: function(data) {
                    $("#loading").hide();
                    if (data.responseText)
                        $scope.showMessage(data.responseText);
                    else
                        $scope.showMessage("Error in update profile data.");
                    console.log('error');
                }
            });

        }

        $scope.$on('fb.auth.authResponseChange', function() {
            $scope.status = $facebook.isConnected();
            if ($scope.status && $rootScope.alreadyLogin != 1) {
                var promise = loginService.FBLogin();
                promise.then(function(value) {
                    if (value == true) {
                        $rootScope.alreadyLogin = 1;
                        $('.modal').removeClass('open');
                    }
                });
            }
        });

        $rootScope.loginToggle = function() {
            if ($scope.status) {
                $facebook.logout();
            } else {
                $facebook.login();
            }
        };


        $scope.login = function(username, password) {
            $scope.errorMessage = '';
            var promise = loginService.login(username, password);
            promise.then(function(value) {
                if (value == true) {
                    $rootScope.alreadyLogin = 1;
                    $('.modal').removeClass('open');
                } else {
                    $scope.errorMessage = value;
                }
            });
        }

        $scope.doLogin = function() {
            $scope.errorMessage1 = '';
            $scope.successMessage = "";
            $('#login-modal').addClass("open");
        }

        $scope.forgotPassword = function(email) {
            $scope.errorMessage1 = '';
            $scope.successMessage = "";
            var promise = loginService.forgot(email);
            promise.then(function(value) {
                if (value == true) {
                    $scope.successMessage = "Reset password link is sent on your email id.";
                } else {
                    $scope.errorMessage1 = value;
                }
            });
        }

        $scope.preProfile = function() {
            $scope.errorMessage = '';
            if (!$scope.userDetails.email) {
                $scope.errorMessage = "Please fill email address.";
            } else if (!validateEmail($scope.userDetails.email)) {
                $scope.errorMessage = "Please fill valid email address.";
            } else {

                //Telling server its just a information update and not picture update
                delete $scope.userDetails.picture;
                delete $scope.userDetails.social_picture;

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

                response.success(function(data, status) {
                    $scope.getDetailOfUser();
                    $('.modal').removeClass('open');
                }).error(function() {
                    $scope.showMessage("Error in update user details.");
                    //Error
                    console.log("error");
                });
            }
        }

        $scope.closePopUp = function() {
            $('.modal').removeClass('open');

            if ($rootScope.extrainfoCalledFromWhoami) {
                $scope.logout();
            }

            resetExtrainfoCalledFromWhoami();
        }

        $scope.getDetailOfUser = function() {
            var promise = dataService.whoami();
            promise.then(function(value) {
                $scope.userDetails = value;
            });
        }

        $scope.goToHome = function() {
          window.location.href = '';
        }

        $scope.goToSignup = function() {
            $('.modal').removeClass('open');
          window.location.href = '/signup';
        }

        $scope.goToUserDashboard = function() {
        window.location.href = '/user-dashboard';
        }

        // for cities in footer
        $scope.getFooterCities = function(value) {
            $rootScope.footerCities = value;
            angular.forEach($rootScope.footerCities, function(val, key) {
                $rootScope.footerCities[key].city = val.city.capitalize();
                $rootScope.footerCities[key].state = val.state.capitalize();
            });
        }

        // for groups in footer
        var promise = dataService.getGroups();
        promise.then(function(value) {
            $rootScope.footerGroups = value.results;
            angular.forEach($rootScope.footerGroups, function(val, key) {
                $rootScope.footerGroups[key].name = val.name.capitalize();
            });
        });

        $scope.goToSearch = function(city) {
            var newPath = "/search?";
            if (city.city)
                newPath += "city=" + city.city + '&';
            if (city.state)
                newPath += "state=" + city.state;
          window.location.href = newPath;
        }
        $scope.goToCommunity = function(name) {
            if (name.toLowerCase() == 'see all')
              window.location.href = '/find-your-people';
            else
              window.location.href = '/community/' + name;
        }

        $scope.showContactMessage = function() {
            $scope.showMessage("Please send us an email at support@explorelifetraveling.com for any questions/queries/concerns.");
        }
        $scope.showListYourPropertyMessage = function() {
            if ($rootScope.alreadyLogin == 1) {
                $scope.showMessage("Please send us an email at support@explorelifetraveling.com for listing your property or if you would like to create a community.");
            } else {
                $scope.doLogin();
            }
        }

        $scope.showMessage = function(message, onOkClickFunction, showTextBox, showSocialLink) {
            $scope.showMessageValue = message;
            $scope.showCancleButton = false;
            $scope.showMsg = {};
            $scope.showMsg.input = "";
            $scope.showMsg.linkedIn = "";
            $scope.showMsg.facebook = "";
            $scope.showMsg.showError = false;
            $scope.showOkButton = false;
            $scope.showSocialLink = showSocialLink;
            if (onOkClickFunction) {
                $scope.onOkClickFunction = onOkClickFunction;
                $scope.showCancleButton = true;
            }
            if (showTextBox == false) {
                $scope.showCancleButton = false;
                $scope.showOkButton = true;
            }

            if (!$scope.$$phase) {
                $scope.$apply();
            }

            if ($scope.showMessageValue)
                $('#message-modal').addClass("open");
        }

        $scope.scrollModel = function() {
            $('#extrainfo-modal').scrollTop(350);
        }

        $scope.resendVerifyLink = function(username) {
            $http({
                url: EXPLORE.urlHelper.users + 'email_verification/',
                method: 'POST',
                data: {
                    email: username
                }
            }).then(function(response) {
                $scope.errorMessage = '';
                $scope.showMessage('Verication Link has been resent to your email.');
            });
        };

    }]);
