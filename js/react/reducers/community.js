import { combineReducers } from 'redux';
import { actions as appActions, getState as appState } from './index.js';
import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';
import { Groups } from '../lib/api.js';
import { groupTransform, groupRequestTransform } from '../data-shapes/group';
import messages from '../constants/messages.js';
import requestStateReducer from '../lib/requestReducerHelper.js';

export const types = {
    communitiesFetch: genFetchTypes('COMMUNITIES_FETH'),
    joinRequestsFetch: genFetchTypes('JOIN_REQUESTS_FETH'),
    joinRequestCreate: genFetchTypes('JOIN_REQUEST_CREATE')
};

const defaultState = {
    communities: {},
    joinRequests: {}
};

/**
 * Assumes we get all the communities in a single request. Ex,
 * overrides the communites list, each time.
 */
const communityReducer = (state = defaultState, { type, payload }) => {
    switch (type) {
    case types.communitiesFetch.SUCCESS: {
        const communities = payload.reduce((obj, com) => {
            if (com.status.toLowerCase() !== 'published') {
                return obj;
            }

            return { ...obj, ...{ [com.name.toLowerCase()]: com } };
        }, {});

        return {
            ...state,
            communities: {
                ...state.communities,
                ...communities
            }
        };
    }
    case types.joinRequestsFetch.SUCCESS: {
        const joinRequests = payload.reduce((obj, req) => Object.assign(obj, { [req.groupName]: req }), {});
        return { ...state, joinRequests };
    }
    case types.joinRequestCreate.SUCCESS:
        return {
            ...state,
            joinRequests: Object.assign(state, { [payload.groupName]: payload })
        };
    default:
        return state;
    }
};

const actions = {
    fetchCommunity: communityName => simpleJSONFetchDispatcher({
        promiseFn: () => Groups.get({ name: communityName }),
        actionTypes: types.communitiesFetch,
        transform: resp => resp.results.map(res => res && groupTransform(res))
    }),

    fetchJoinRequests: () => simpleJSONFetchDispatcher({
        promiseFn: () => Groups.groupRequests(),
        actionTypes: types.joinRequestsFetch,
        transform: resp => resp.results.map(res => groupRequestTransform(res))
    }),

    createJoinRequest: (message, communityName) => (dispatch, getState) => {
        const state = getState();
        const currentCommunity = appState.community.get(state, communityName);
        const pendingRequest = appState.community.getJoinRequests(state, communityName);

        if (!currentCommunity) {
            return Promise.resolve();
        }

        if (pendingRequest) {
            dispatch(appActions.modals.showMessageModal(
                messages.NOTIFICATION_SENT_MESSAGE_TITLE,
                messages.JOIN_COMMUNITIES_NOTIFICATION_SENT
            ));
            return Promise.resolve();
        }

        const requestState = dispatch(simpleJSONFetchDispatcher({
            promiseFn: () => Groups.createGroupRequest({ join_message: message, group: currentCommunity.url }),
            actionTypes: types.joinRequestCreate,
            transform: groupRequestTransform,
            returnResponse: true
        }));

        return requestState
            .then(() => {})
            .catch((err) => {
                dispatch(appActions.modals.showMessageModal(
                    'Error',
                    Object.values(err).join(', ')
                ));
                return Promise.resolve();
            })
            .then(() => {
                if (currentCommunity && pendingRequest) {
                    dispatch(appActions.modals.showMessageModal(
                        messages.NOTIFICATION_SENT_MESSAGE_TITLE,
                        messages.NOTIFICATION_SENT_MESSAGE
                    ));
                }
                return Promise.resolve();
            });
    }
};

const getFns = {
    get: (state, communityName = '') => state.community.communities[communityName.toLowerCase()],
    isFetching: (state, name) =>
        state.communityFetchState[name] && state.communityFetchState[name].isFetching,
    getJoinRequests: (state, communityName = '') => state.community.joinRequests[communityName],
    createRequestStatus: state => state.createRequestState.isFetching,
    joinRequestStatus: state => state.joinRequestState.isFetching
};

export default {
    actions,
    get: getFns,
    reducer: combineReducers({
        community: communityReducer,
        communityFetchState: requestStateReducer(types.communitiesFetch),
        createRequestState: requestStateReducer(types.joinRequestCreate),
        joinRequestState: requestStateReducer(types.joinRequestsFetch)
    })
};
