import { combineReducers } from 'redux';

import { User, Session } from '../lib/api.js';
import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';
import requestStateReducer from '../lib/requestReducerHelper.js';
import idFromURLEnd from '../lib/idFromURLEnd.js';
import { setUserSessionToken, getUserSessionToken, deleteUserBrowserSession } from '../lib/session.js';
import { userTransform } from '../data-shapes/user.js';

import { getState as appState, actions as appActions } from './index.js';


export const types = {
    sessionUser: genFetchTypes('SESSION_USER'),
    userLogin: genFetchTypes('USER_LOGIN'),
    userLogout: genFetchTypes('USER_LOGOUT'),
    resetPassword: genFetchTypes('RESET_PASSWORD'),
    sessionResolved: 'SESSION_RESOLVED',

    loggingWithFb: 'LOGGING_WITH_FB',
    missingUserInfo: 'MISSING_USER_INFO',
    loggedInFromFb: 'LOGGED_IN_FROM_FB',
    shouldRedirectAfterSignup: 'REDIRECT_FROM_SIGNUP'
};

const fetchSessionUserReducer = (state = { resolved: false }, { type, payload, error }) => {
    switch (type) {
    case types.sessionUser.SUCCESS:
        return { ...state, id: idFromURLEnd(payload.url) };
    case types.sessionUser.FAILURE:
    case types.userLogout.PENDING:
        return { resolved: state.resolved };
    case types.userLogout.SUCCESS:
        return {};
    case types.userLogin.FAILURE:
        return { ...state, loginFailed: true,
                 error: error.non_field_errors[0]
               };
    case types.sessionResolved:
        return { ...state, resolved: true };
    case types.loggingWithFb:
        return { ...state, loggingWithFb: !(state && state.loggingWithFb) };
    case types.missingUserInfo:
        return { ...state, missingUserInfo: payload.missing };
    case types.loggedInFromFb:
        return { ...state, loggedInFromFb: payload.loggedInFromFb };
    default:
        return state;
    }
};

const shouldRedirectAfterSignupReducer = (state = false, { type, payload }) => {
    switch (type) {
    case types.shouldRedirectAfterSignup:
        return payload;
    default:
        return state;
    }
};

const getFns = {
    isFetching(state) {
        return state.fetchSessionUserState.isFetching;
    },
    isResolved(state) {
        return state.fetchSessionUser && state.fetchSessionUser.resolved;
    },
    userId(state) {
        return state.fetchSessionUser && state.fetchSessionUser.id;
    },
    hasSession(state) {
        return !!(state.fetchSessionUser && state.fetchSessionUser.id);
    },
    loginFailed(state) {
        return state.fetchSessionUser && state.fetchSessionUser.loginFailed;
    },
    loginErrorMessage(state) {
        return state.fetchSessionUser && state.fetchSessionUser.error;
    },
    isLoggingWithFb(state) {
        return state.fetchSessionUser && state.fetchSessionUser.loggingWithFb;
    },
    missingUserInfo(state) {
        return state.fetchSessionUser && state.fetchSessionUser.missingUserInfo;
    },
    loggedInFromFb(state) {
        return state.fetchSessionUser && state.fetchSessionUser.loggedInFromFb;
    },
    shouldRedirectAfterSignup(state) {
        return state.shouldRedirectAfterSignup;
    }
};

const getUser = (state) => {
    const userId = appState.session.userId(state);
    return appState.user.getUser(state, userId);
};

const actions = {
    setSession: () => (dispatch, getState) => {
        const token = getUserSessionToken();
        if (!token) {
            dispatch({ type: types.sessionResolved });
            return null;
        }

        return dispatch(simpleJSONFetchDispatcher({
            promiseFn: () => Session.get(),
            actionTypes: types.sessionUser,
            transform: userTransform
        })).then(() => {
            /**
             * Check if we receive enough user information
             * from the server. If not, redirect the user to
             * the sign-up page, and give essential fields like email, etc
             */
            const user = getUser(getState());
            const loggingWithFb = appState.session.isLoggingWithFb(getState());
            if (user.email.endsWith('@example.com') || !user.phone) {
                dispatch(actions.setMissingUserInfo(true));
            } else {
                dispatch(actions.setMissingUserInfo(false));
            }
            if (loggingWithFb) {
                dispatch(actions.setLoggedInFromFb(true));
            }
            dispatch({ type: types.sessionResolved });
        });
    },
    loginUser: data => simpleJSONFetchDispatcher({
        promiseFn: () => User.login(data),
        transform: ({ key }) => {
            /* saves the cookie; and returns the data as is */
            setUserSessionToken(key);
            return key;
        },
        actionTypes: types.userLogin
    }),
    fbLoginUser: token => simpleJSONFetchDispatcher({
        promiseFn: () => User.fbLogin(token),
        transform: ({ key }) => {
            /* saves the cookie; and returns the data as is */
            setUserSessionToken(key);
            return key;
        },
        actionTypes: types.userLogin
    }),
    logoutUser: () => {
        deleteUserBrowserSession();

        return simpleJSONFetchDispatcher({
            promiseFn: () => User.logout(),
            actionTypes: types.userLogout
        });
    },
    toggleLoggingWithFb: () => {
        return { type: types.loggingWithFb };
    },
    setMissingUserInfo: (missing) => {
        return { type: types.missingUserInfo,
                 payload: { missing }
               };
    },
    setLoggedInFromFb: (loggedInFromFb) => {
        return { type: types.loggedInFromFb,
                 payload: { loggedInFromFb }
               };
    },
    resetPassword: data => simpleJSONFetchDispatcher({
        promiseFn: () => User.resetPassword(data),
        actionTypes: types.resetPassword
    }),
    setShouldRedirectAfterSignup: payload => ({
        type: types.shouldRedirectAfterSignup,
        payload
    })
};

export default {
    actions,
    get: getFns,
    reducer: combineReducers({
        fetchSessionUser: fetchSessionUserReducer,
        fetchSessionUserState: requestStateReducer(types.sessionUser),
        shouldRedirectAfterSignup: shouldRedirectAfterSignupReducer
    })
};
