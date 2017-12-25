import { combineReducers } from 'redux';

import { Phone } from './../lib/api.js';
import { genFetchTypes, simpleJSONFetchDispatcher } from './../lib/actionHelpers.js';
import requestStateReducer from '../lib/requestReducerHelper.js';
import idFromURLEnd from '../lib/idFromURLEnd.js';

import { getState as appState } from './index.js';

export const types = {
    registerPhoneFetch: genFetchTypes('REGISTER_PHONE'),
    phoneInfoFetch: genFetchTypes('PHONE_INFO'),
    requestPhoneVerification: genFetchTypes('REQUEST_PHONE_VERIFICATION'),
    verifyPhone: genFetchTypes('VERIFY_PHONE')
};


const registerPhoneReducer = (state = {}, { type, id, payload }) => {
    switch (type) {
    case types.registerPhoneFetch.SUCCESS:
        return { ...state, ...{ [id]: payload } };
    case types.phoneInfoFetch.SUCCESS:
        return { ...state, ...{ [id]: payload.id,
                                verified: payload.other.phone_verified } };
    case types.phoneInfoFetch.FAILURE:
    case types.registerPhoneFetch.FAILURE:
        return { ...state, ...{ [id]: null } };
    default:
        return state;
    }
};

const sendVerificationReducer = (state = null, { type, id, payload }) => {
    switch (type) {
    case types.requestPhoneVerification.PENDING:
    case types.requestPhoneVerification.SUCCESS:
    case types.requestPhoneVerification.FAILURE:
    default:
        return state;
    }
};


const verifyPhoneReducer = (state = null, { type, id, payload }) => {
    switch (type) {
    case types.verifyPhone.PENDING:
    case types.verifyPhone.SUCCESS:
    case types.verifyPhone.FAILURE:
    default:
        return state;
    }
};

const actions = {
    fetchRegisterPhone: phone =>
        simpleJSONFetchDispatcher({
            id: phone,
            promiseFn: () => Phone.register(phone),
            actionTypes: types.registerPhoneFetch,
            transform: res => res && idFromURLEnd(res.url)
        }),
    fetchRequestSendCode: verificationId =>
        simpleJSONFetchDispatcher({
            id: verificationId,
            promiseFn: () => Phone.sendCode(verificationId),
            actionTypes: types.requestPhoneVerification
        }),
    fetchRequestVerifyCode: (phone, code) => (dispatch, getState) => {
        const verificationId = appState.phone.verificationId(getState(), phone);

        return dispatch(simpleJSONFetchDispatcher({
            id: verificationId,
            promiseFn: () => Phone.confirmCode(verificationId, code),
            actionTypes: types.verifyPhone
        }));
    },
    fetchPhoneInfo: phone =>
        simpleJSONFetchDispatcher({
            id: phone,
            promiseFn: () => Phone.fetch(phone),
            actionTypes: types.phoneInfoFetch,
            transform: res => {
                const phoneInfo = res.results[0];
                return { id: idFromURLEnd(res.results[0].url),
                         other: phoneInfo };
            }
        }),
    fetchRegisterAndSendCode: phone => (dispatch, getState) => {
        return dispatch(actions.fetchRegisterPhone(phone)).then(() => {
            const error = appState.phone.sendingCodeFailure(getState(), phone);
            if (error) {
                throw new Error(error);
            }
            const verificationId = appState.phone.verificationId(getState(), phone);
            return dispatch(actions.fetchRequestSendCode(verificationId));
        }).catch((e) => {
            if (!e || !e[0].match(/number already exists/i)) {
                throw new Error(e);
            }
            // Number already exists
            // Fetch the number info, if not_verified follow the same flow,
            // otherwise skip the verification step
            return dispatch(actions.fetchPhoneInfo(phone)).then(() => {
                const verified = appState.phone.isAlreadyVerified(getState());
                if (verified) {
                    return null;
                }
                const verificationId = appState.phone.verificationId(getState(), phone);
                return dispatch(actions.fetchRequestSendCode(verificationId));
            });
        });
    }
};

const getFns = {
    isSendingCodeInProgress(state, phone) {
        return state.registerState[phone].isFetching || state.sendCodeState[phone].isFetching;
    },
    sendingCodeFailure(state, phone) {
        const registerError = state.registerState[phone] && state.registerState[phone].error;
        const sendCodeError = state.sendCodeState[phone] && state.sendCodeState[phone].error;
        return registerError || sendCodeError;
    },
    verificationId(state, phone) {
        return state.register[phone];
    },
    isVerificationInProgress(state) {
        return state.verifyState.isFetching;
    },
    isAlreadyVerified(state) {
        return state.register.verified;
    }
};

export default {
    reducer: combineReducers({
        register: registerPhoneReducer,
        registerState: requestStateReducer(types.registerPhoneFetch),
        sendCode: sendVerificationReducer,
        sendCodeState: requestStateReducer(types.requestPhoneVerification),
        verify: verifyPhoneReducer,
        verifyState: requestStateReducer(types.verifyPhone)
    }),
    actions,
    get: getFns
};
