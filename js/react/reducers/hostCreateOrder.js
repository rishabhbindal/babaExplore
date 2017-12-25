import { combineReducers } from 'redux';

import { Host } from './../lib/api.js';
import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';
import requestStateReducer from '../lib/requestReducerHelper.js';
import { userTransform } from './../data-shapes/user';

export const types = {
    checkRegistrationStatus: genFetchTypes('CHECK_REGISTRATION_STATUS'),
    resetHostCreateOrder: genFetchTypes('RESET_HOST_CREATE_ORDER'),
    guestCreate: genFetchTypes('GUEST_CREATE'),
    createHostOrder: genFetchTypes('CREATE_HOST_ORDER')
};

const checkRegistrationStatusReducer = (state = {}, { type, payload }) => {
    switch (type) {
    case types.guestCreate.SUCCESS:
    case types.checkRegistrationStatus.SUCCESS:
        return { ...state, ...payload };
    case types.resetHostCreateOrder:
        return {};
    default:
        return state;
    }
};

const actions = {
    checkRegistrationStatus: (email, propertyId) => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.getUsers(email),
            actionTypes: types.checkRegistrationStatus,
            transform: ({ count, results }) => ({
                email,
                propertyId,
                status: (count > 0),
                guest: results.map(result => userTransform(result))[0]
            })

        })
    ),

    createGuest: (data, propertyId) => (
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.createGuest(data),
            actionTypes: types.guestCreate,
            returnResponse: true,
            transform: res => ({
                email: res.email,
                propertyId,
                status: true,
                guest: userTransform(res)
            })
        })
    ),

    createOrderByHost: (params, propertyId) => (
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.createOrderByHost(params),
            actionTypes: types.createHostOrder,
            returnResponse: true
        })
    ),

    resetHostCreateOrder: () => ({
        type: types.resetHostCreateOrder
    })
};

const getFns = {
    checkRegistrationStatus: state => state.checkRegistrationStatus.status,
    checkRegistrationStatusLoading: state => state.checkRegistrationStatusState.isFetching,
    guest: state => state.checkRegistrationStatus.guest,
    inputEmail: state => state.checkRegistrationStatus.email,
    isActiveProperty: (state, propertyId) => (state.checkRegistrationStatus.propertyId === propertyId),
    isGuestCreating: state => state.guestCreateStatus.isFetching,
    isOrderCreating: state => state.createHostOrderState.isFetching
};

export default {
    actions,
    get: getFns,
    reducer: combineReducers({
        checkRegistrationStatus: checkRegistrationStatusReducer,
        checkRegistrationStatusState: requestStateReducer(types.checkRegistrationStatus),
        createHostOrderState: requestStateReducer(types.createHostOrder),
        guestCreateStatus: requestStateReducer(types.guestCreate)
    })
};
