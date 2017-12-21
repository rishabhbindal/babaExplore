/* global angular */

import moment from 'moment';
import calculateAge from '../lib/calculateAge.es6.js';
import readImage from '../lib/readImage.es6.js';
import analytics from '../lib/analytics.es6.js';

/* eslint-disable max-len */
const MSG_CHECK_EMAIL = 'Please check your email for the email address confirmation from ExploreLifeTraveling. Please also check your spam folder or promotion tab in case you don\'t see ExploreLifeTraveling email in your inbox';
const MSG_ADD_DESCRIPTION = 'Help other people get to know you better. Please write at least 80 characters about yourself. Leave the field blank if you don\'t want to enter the information now.';
/* eslint-enable max-len */

function SignupController(
    $scope, $location, loginService, $rootScope, $filter,
    $routeParams, $timeout, titleService, descriptionService
) {
    const UserData = function () {
        this.errors = [];

        function validateTextField(propName, val, minLength, regex, errorMessage) {
            if (propName !== 'about yourself' && !val) {
                this.errors.push(errorMessage || `Please fill ${propName}.`);
                return;
            }

            if (minLength && val && val.length < minLength) {
                this.errors.push(MSG_ADD_DESCRIPTION);
            }

            if (regex && !regex.test(val)) {
                if (propName === 'username') {
                    this.errors.push('Email address is not valid');
                } else {
                    this.errors.push(`${propName.capitalize()} can contain only characters`);
                }
            }
        }

        this.validateDOB = function () {
            if (!this.dob_dd && !this.dob_mm && !this.dob_yyyy) {
                this.errors.push('Please fill Date of Birth');
                return;
            } else {
                if (!this.dob_dd) {
                    this.errors.push('Invalid Day in Date of Birth');
                }

                if (!this.dob_mm) {
                    this.errors.push('Invalid Month in Date of Birth');
                }

                if (!this.dob_yyyy) {
                    this.errors.push('Invalid Year in Date of Birth, enter in yyyy format.');
                }
            }

            if (!moment(this.date_of_birth, 'DDMMYYY').isValid()) {
                this.errors.push('Wrong combination of Date and Month in Date of Birth.');
            }

            const age = calculateAge(this.date_of_birth);
            if (age < 0) {
                this.errors.push('Date of Birth is in future.');
            }

            if (age < 18) {
                this.errors.push('You must be at least 18 years of age.');
            }

            if (age > 90) {
                this.errors.push('You must be at most 90 years of age.');
            }
        };

        this.passwordsMatch = function () {
            return this.password === this.conpassword;
        };

        this.isValid = function () {
            // reset this.errors if this is not first run
            if (this.errors.length) {
                this.errors = [];
            }

            const textFields = [{
                name: 'first name',
                val: this.firstname,
                regex: NAME_REGEXP
            }, {
                name: 'last name',
                val: this.lastname,
                regex: NAME_REGEXP
            }, {
                name: 'city',
                val: this.city,
                regex: NAME_REGEXP
            }, {
                name: 'about yourself',
                val: this.about,
                minLength: 80
            }, {
                name: 'email',
                val: this.username,
                regex: EMAIL_REGEXP
            }, {
                name: 'phone number',
                val: this.details.phone_number
            }, {
                name: 'gender',
                val: this.gender,
                errorMessage: 'Please select gender.'
            }, {
                name: 'password',
                val: this.password
            }, {
                name: 'confirm password',
                val: this.conpassword
            }, {
                name: 'terms',
                val: this.terms,
                errorMessage: 'Please accept Terms and Conditions.'
            }];

            // call all validation functions
            textFields.forEach(function (textField) {
                validateTextField.apply(this, [
                    textField.name,
                    textField.val,
                    textField.minLength,
                    textField.regex,
                    textField.errorMessage
                ]);
            }, this);

            this.validateDOB();

            return !this.errors.length;
        };
    };

    $scope.isHomePage = false;
    $scope.data = new UserData();
    $scope.data.about = '';

    titleService.setTitle('Sign Up | Explore Life Traveling', $scope);
    descriptionService.setDescription('Sign up for www.explorelifetraveling.com. ' +
                                      ' to be able to book the best homestays, all verified by our team.', $scope);

    var PHONE_REGEXP = /^[(]{0,1}[0-9]{3}[)\.\- ]{0,1}[0-9]{3}[\.\- ]{0,1}[0-9]{4}$/;
    var NAME_REGEXP = /^[A-Za-z ]+$/;
    var EMAIL_REGEXP = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    $scope.$watch('alreadyLogin', function (newValue) {
        if (newValue === 1) {
            $location.url('/home');
        }
    });

    analytics.pageView({ title: 'Signup page' });

    function getMaxDigits(val, max) {
        if (typeof val === 'undefined') {
            return null;
        }

        while (val > max) {
            val = parseInt(val / 10);
        }
        return val;
    }

    $scope.checkDate = function () {
        $scope.data.dob_dd = getMaxDigits($scope.data.dob_dd, 31);
    };

    $scope.checkMonth = function () {
        $scope.data.dob_mm = getMaxDigits($scope.data.dob_mm, 12);
    };

    $scope.checkYear = function () {
        const minYear = moment().subtract(90, 'years').year();
        const maxYear = moment().year();
        $scope.data.dob_yyyy = getMaxDigits($scope.data.dob_yyyy, maxYear);
    };

    window.$('#picture').change(function () {
        readImage({ input: this, previewEl: document.getElementById('user_profile_img') });
    });

    $scope.signup = function () {
        $scope.errorMessage = '';
        $scope.successMessage = '';
        $scope.data.date_of_birth = [$scope.data.dob_dd, $scope.data.dob_mm, $scope.data.dob_yyyy].join('/');

        $scope.data.details.phone_number = window.$('#phone_number').intlTelInput('getNumber');

        const picture = document.getElementById('picture');

        if (!$scope.data.isValid()) {
            $scope.errorMessage = $scope.data.errors.join('\n');
        } else {
            const dateInput = new Date( $scope.data.dob_yyyy,  $scope.data.dob_mm - 1, $scope.data.dob_dd);
            $scope.data.date_of_birth_valid = $filter('date')(dateInput, 'yyyy-MM-dd');

            if (picture.files[0]) {
                $scope.data.picture = picture.files[0];
            }
            window.$('#sign_up_loader').show();
            const promise = loginService.register($scope.data);
            promise.then(function (value, type) {
                window.$('#sign_up_loader').hide();
                if (typeof value === 'object') {
                    $scope.showMessage(MSG_CHECK_EMAIL, function () {
                        $location.path('/');
                        $timeout(function () {
                            $location.url('/');
                        }, 100);
                    }, false);
                } else {
                    $scope.errorMessage = value;
                }
            });
        }
    };

    window.eltInit(window.$('*[data-init]').toArray());
    $timeout(function (){
        window.eltInit(window.$('*[data-init]').toArray());
    }, 1000);
}

SignupController.$inject = [
    '$scope', '$location', 'loginService', '$rootScope',
    '$filter', '$routeParams', '$timeout', 'titleService',
    'descriptionService'
];

angular.module('explore').controller('SignupController', SignupController);
