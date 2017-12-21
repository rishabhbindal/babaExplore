/* global angular */
import utils from '../utils.js';
import analytics from '../lib/analytics.es6.js';
import errorMessages from '../lib/messageConstants.es6.js';

const EXPLORE = utils.EXPLORE;

const { EMPTY_FIELDS, ERROR_INTERNET, WRONG_CREDENTIALS } = errorMessages;

const getToken = utils.getToken;
const checkForLocalStorage = utils.checkForLocalStorage;
const deleteCookies = utils.deleteCookies;

function LoginService($http, $location, $q, ApiRequest, globalFunctionsService, $facebook, $rootScope) {
    const saveUserKey = (userKey) => {
        if (checkForLocalStorage()) {
            window.localStorage.userKey = userKey;
            window.localStorage.isLogin = '1';
            return;
        }

        document.cookie = `userKey=${userKey}`;
        document.cookie = 'isLogin=1';
    };

    const login = (username, userpass) => {
        const deferred = $q.defer();

        if (username === undefined || username.trim() === '' || userpass === undefined || userpass.trim() === '') {
            deferred.resolve(EMPTY_FIELDS);
        } else {
            const param = {
                username,
                password: userpass
            };
            const reqAnalytics = analytics.request('Login');
            reqAnalytics.start();

            $http({
                url: EXPLORE.urlHelper.login,
                data: (param),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                }
            }).success((data, status) => {
                if (data.key !== undefined && data.key) {
                    document.cookie.split(';').forEach((c) => {
                        document.cookie = c.replace(/^ +/, '').replace(/\=.*/, `=;expires=${new Date().toUTCString()};path=/`);
                    });
                    saveUserKey(data.key);
                    deferred.resolve(true);
                    window.location.reload();
                } else if (data.error !== undefined && data.error) {
                    deferred.resolve(WRONG_CREDENTIALS);
                } else {
                    deferred.resolve(WRONG_CREDENTIALS);
                }
            }).error((data) => {
                reqAnalytics.failure({
                    eventLabel: utils.GetJSONstringfyifNeeded(data)
                });
                if (data.detail) {
                    deferred.resolve(data.detail);
                } else if (data.non_field_errors) {
                    deferred.resolve(data.non_field_errors[0]);
                } else {
                    deferred.resolve(WRONG_CREDENTIALS);
                }
            });
        }

        return deferred.promise;
    };


    const FBLogin = () => {
        const deferred = $q.defer();

        const reqAnalytics = analytics.request('FB Login');
        reqAnalytics.start();

        $http({
            url: EXPLORE.urlHelper.facebook,
            data: {
                access_token: window.FB.getAuthResponse().accessToken
            },
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }).success((data, status) => {
            if (data.key !== undefined && data.key) {
                reqAnalytics.success();
                saveUserKey(data.key);
                deferred.resolve(true);
                document.cookie.split(';').forEach((c) => {
                    document.cookie = c.replace(/^ +/, '').replace(/\=.*/, `=;expires=${new Date().toUTCString()};path=/`);
                });
                window.location.reload();
            } else if (data.error !== undefined && data.error) {
                deferred.resolve(WRONG_CREDENTIALS);
            } else {
                deferred.resolve(WRONG_CREDENTIALS);
            }
        }).error((data) => {
            reqAnalytics.failure({ eventLabel: utils.GetJSONstringfyifNeeded(data) });
            deferred.resolve(WRONG_CREDENTIALS);
        });


        return deferred.promise;
    };

    const register = (newUserData) => {
        const deferred = $q.defer();

        if (newUserData.username === undefined || newUserData.username.trim() === ''
            || newUserData.password === undefined || newUserData.password.trim() === ''
            || newUserData.conpassword === undefined || newUserData.conpassword.trim() === ''
            || newUserData.firstname === undefined || newUserData.firstname.trim() === ''
            || newUserData.lastname === undefined || newUserData.lastname.trim() === '') {
            deferred.resolve(EMPTY_FIELDS);
        } else if (newUserData.conpassword !== newUserData.password) {
            deferred.resolve('Password and confirm password not matched.');
        } else {
            const formData = new FormData();
            formData.append('password', newUserData.password);
            formData.append('email', newUserData.username);
            formData.append('first_name', newUserData.firstname);
            formData.append('last_name', newUserData.lastname);
            formData.append('date_of_birth', newUserData.date_of_birth_valid);
            if (newUserData.about) {
                formData.append('details.about', newUserData.about);
            }
            formData.append('details.city', newUserData.city || null);
            formData.append('details.phone_number', newUserData.details.phone_number || null);
            formData.append('details.state', newUserData.state || null);
            formData.append('details.country', newUserData.country || null);
            formData.append('details.street_address', newUserData.street_address || null);
            formData.append('details.gender', newUserData.gender || null);
            formData.append('details.terms_accepted', newUserData.terms);

            if (newUserData.picture) {
                formData.append('picture', newUserData.picture);
            }

            const reqAnalytics = analytics.request('Register');
            reqAnalytics.start();

            $http({
                method: 'POST',
                cache: false,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity,
                data: formData,
                url: EXPLORE.urlHelper.users
            }).success((data, status) => {
                reqAnalytics.success();
                deferred.resolve(data);
            }).error((data) => {
                reqAnalytics.failure({
                    eventLabel: utils.GetJSONstringfyifNeeded(data)
                });
                if (data[0]) {
                    deferred.resolve(data[0]);
                } else {
                    angular.forEach(data, (val) => {
                        deferred.resolve(val[0]);
                    });
                }
            });
        }

        return deferred.promise;
    };


    const forgot = (username) => {
        const deferred = $q.defer();

        if (username === undefined || username.trim() === '') {
            deferred.resolve('Kindly enter email address.');
        } else {
            const isOnline = globalFunctionsService.checkConnection();
            if (!isOnline) {
                alert(ERROR_INTERNET);
                deferred.reject(false);
            }

            const param = {
                email: username
            };

            const reqAnalytics = analytics.request('Forgot');
            reqAnalytics.start();

            $http({
                url: EXPLORE.urlHelper.users + 'reset_password/',
                data: (param),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=UTF-8'
                }
            }).success((data, status) => {
                reqAnalytics.success();
                deferred.resolve(true);
            }).error((data) => {
                reqAnalytics.failure({
                    eventLabel: utils.GetJSONstringfyifNeeded(data)
                });
                deferred.resolve('This Email is not registered with us.');
            });
        }

        return deferred.promise;
    };

    // const isLogin = () => {
    //     const deferred = $q.defer();
    //     const isLogin = checkForLocalStorage() ? window.localStorage.isLogin :
    //         parseIntdocument.cookie.replace(/(?:(?:^|.*;\s*)isLogin\s*\=\s*([^;]*).*$)|^.*$/, '$1');
    //     if (isLogin !== undefined && isLogin === '1') deferred.resolve(true);
    //     else deferred.resolve(false);
    //     return deferred.promise;
    // };

    // const checkAuthentication = () => {
    //     const deferred = $q.defer();
    //     const isLogin = window.localStorage.isLogin;
    //     if (isLogin === 1) deferred.resolve(true);
    //     else deferred.resolve(false);

    //     const promise = deferred.promise;
    //     promise.then((value) => {
    //         if (value === false) {

    //         } else {
    //             return true;
    //         }
    //     });
    // }

    const logout = () => {
        const status = $facebook.isConnected();
        if (status) {
            window.FB.logout((response) => {
                // user is now logged out
                // console.log(response);
            });
        }
        const key = getToken();
        const reqAnalytics = analytics.request('Logout');
        reqAnalytics.start();

        $http({
            url: EXPLORE.urlHelper.logout,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                Authorization: key
            }
        }).success((data, status) => {
            window.location.reload();
            reqAnalytics.success();
        }).error((data) => {
            window.location.reload();
            reqAnalytics.failure({
                eventLabel: utils.GetJSONstringfyifNeeded(data)
            });
        });

        window.localStorage.clear();
        $rootScope.userDetails = undefined;
        deleteCookies();
    };

    // const sessionExpire = () => {
    //     alert('Session Expire');
    //     logout();
    // }

    return {
        login,
        FBLogin,
        register,
        forgot,
        logout
        // isLogin: isLogin,
        // checkAuthentication: checkAuthentication,
        // sessionExpire: sessionExpire
    };
}

LoginService.$inject = [
    '$http', '$location', '$q', 'ApiRequest',
    'globalFunctionsService', '$facebook', '$rootScope'
];
angular.module('explore').service('loginService', LoginService);
