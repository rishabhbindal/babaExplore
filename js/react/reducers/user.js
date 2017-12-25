import { combineReducers } from 'redux';
import moment from 'moment';

import { User } from '../lib/api.js';
import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';
import requestStateReducer from '../lib/requestReducerHelper.js';
import idFromURLEnd from '../lib/idFromURLEnd.js';
import { userTransform } from '../data-shapes/user.js';
import { types as sessionActTypes } from './session.js';

import reportIfNameUndefined from '../lib/reportIfNameUndefined.js';
import countryCodePrefix from '../lib/countryCodePrefix.js';

const getDOB = (data) => {
    if (!data || !(data.year && data.month && data.day)) {
        return null;
    }
    return [data.year, data.month, data.day].join('-');
};

export const types = {
    userFetch: genFetchTypes('USER'),
    userLookupFetch: genFetchTypes('USER_LOOKUP'),
    userCreate: genFetchTypes('USER_CREATE'),
    changePassword: genFetchTypes('USER_CHANGE_PASSWORD'),
    testUser: genFetchTypes('TEST_USER_PERMISSION'),
    deactivateUser: genFetchTypes('DEACTIVATE_ACCOUNT')
};

const fetchUserReducer = (state = {}, { type, id, payload }) => {
    switch (type) {
    case types.userFetch.SUCCESS:
    case types.userCreate.SUCCESS:
    case sessionActTypes.sessionUser.SUCCESS:
        return { ...state, ...{ [id || idFromURLEnd(payload.url)]: payload } };
    case types.userFetch.FAILURE:
        return { ...state, ...{ [id || idFromURLEnd(payload.url)]: null } };
    case types.userLookupFetch.SUCCESS:
        return { ...state, ...payload };
    default:
        return state;
    }
};

const phoneNumber = (num, code) => {
    if (!num || /^\+/.test(num)) {
        return num;
    }
    const cc = code || '+91';
    const prefix = countryCodePrefix(cc);
    return `${prefix}${cc}${num}`;
};

const getFormData = (data) => {
    const dob = data.dateOfBirth && getDOB(data.dateOfBirth);
    const gender = data.gender && data.gender.toUpperCase();

    const formData = new FormData();

    try {
        reportIfNameUndefined(data, 'manual');
    } catch (e) {
        console.log('Error reported');
    }

    if (data.password) {
        formData.append('password', data.password);
    }
    formData.append('email', data.email);
    formData.append('first_name', data.firstName);
    formData.append('last_name', data.lastName);
    if (dob) {
        formData.append('date_of_birth', dob);
    }
    if (data.age && !dob) {
        const calculatedDOB = moment().subtract(data.age, 'years').startOf('year').format('YYYY-MM-DD');
        formData.append('date_of_birth', calculatedDOB);
    }
    if (data.about) {
        formData.append('details.about', data.about);
    }
    formData.append('details.city', data.city || '');
    formData.append('details.phone_number', phoneNumber(data.phone, data.countryCode) || '');
    formData.append('details.state', data.state || '');
    formData.append('details.country', data.country || '');
    formData.append('details.street_address', data.streetAddress || '');
    formData.append('details.gender', data.gender.toUpperCase() || ''); // TODO
    formData.append('details.terms_accepted', data.terms || true); // TODO

    if (data.picture) {
        formData.append('picture', data.picture);
    }
    return formData;
};

const getJsonData = (data) => {
    const dob = getDOB(data);
    const gender = data.gender && data.gender.toUpperCase();

    const userData = {};
    userData.email = data.email;
    userData.first_name = data.firstName;
    userData.last_name = data.lastName;
    if (dob) {
        userData.date_of_birth = dob;
    }

    userData.details = {};
    if (data.about) {
        userData.details.about = data.about || '';
    }
    userData.details.city = '';
    userData.details.country = '';
    userData.details.state = '';
    userData.details.street_address = '';

    userData.details.phone_number = phoneNumber(data.phone, data.countryCode) || '';
    userData.details.gender = data.gender.toUpperCase() || '';
    userData.details.terms_accepted = data.terms;

    return userData;
};

const actions = {
    fetchUser: url =>
        simpleJSONFetchDispatcher({
            id: idFromURLEnd(url),
            promiseFn: () => User.getById(idFromURLEnd(url)),
            actionTypes: types.userFetch,
            transform: userTransform
        }),
    lookupUser: data =>
        simpleJSONFetchDispatcher({
            promiseFn: () => User.getByLookup(data),
            actionTypes: types.userLookupFetch,
            transform: ({ results }) => results.map((result) => {
                const user = userTransform(result);
                if (user.url) {
                    user.id = idFromURLEnd(user.url);
                }
                return user;
            }),
            returnResponse: true
        }),
    registerUser: (data) => {
        const formData = getFormData(data);
        return simpleJSONFetchDispatcher({
            promiseFn: () => User.register(formData),
            actionTypes: types.userCreate,
            returnResponse: true,
            transform: userTransform
        });
    },
    putUserData: (data, userId) => {
        const formData = getJsonData(data);
        return simpleJSONFetchDispatcher({
            promiseFn: () => User.putUserData(formData, userId),
            actionTypes: types.userCreate,
            returnResponse: true,
            transform: userTransform
        });
    },
    updateUserData: (data, userId) => {
        const formData = getFormData(data);
        return simpleJSONFetchDispatcher({
            promiseFn: () => User.updateUserData(formData, userId),
            actionTypes: types.userCreate,
            returnResponse: true,
            transform: userTransform
        });
    },
    userChangePassword: (data) => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => User.changePassword(data),
            actionTypes: types.changePassword,
            transform: res => res,
            returnResponse: true
        })
    ),
    testUser: () => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => User.testUser(),
            actionTypes: types.testUser,
            returnResponse: true
        })
    ),
    deactivateUser: id => simpleJSONFetchDispatcher({
        promiseFn: () => User.deactivateUser(id),
        actionTypes: types.deactivateUser,
        returnResponse: true
    })
};

const getFns = {
    getUser: (state, id) => state.users[id],
    isFetching: (state, id) => state.fetchUserState[id] && state.fetchUserState[id].isFetching,
    isMemberOf(state, id, groups) {
        const user = state.users[id];
        if (!user) {
            return false;
        }

        return groups.some(g => user.groups.includes(g));
    },
    isRegisteringUser(state) {
        return state.createUserState.isFetching;
    },
    getUserByURL(state, url) {
        return url && state.users[idFromURLEnd(url)];
    },
    isPasswordChanging: state => state.userChangePasswordState.isFetching
};

export default {
    actions,
    get: getFns,
    reducer: combineReducers({
        users: fetchUserReducer,
        fetchUserState: requestStateReducer(types.userFetch),
        createUserState: requestStateReducer(types.userCreate),
        userChangePasswordState: requestStateReducer(types.changePassword)
    })
};
