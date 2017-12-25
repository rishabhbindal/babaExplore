import { combineReducers } from 'redux';

import { Host } from './../lib/api.js';
import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';
import requestStateReducer from '../lib/requestReducerHelper.js';
import { orderStateTransform } from './../data-shapes/order';
import removeDupes from '../lib/removeDupes.js';
import {
    hostAwaitingResponsesTransform,
    hostBookingsTransform,
    hostPropertiesTransform
} from './../data-shapes/hostProperties';
import hostOrderTransform from './../data-shapes/HostOrder';

export const types = {
    hostExperiences: genFetchTypes('HOST_EXPERIENCES'),
    resetExperiences: 'HOST_RESET_EXPERIENCES',
    resetAwaitingExperiences: 'HOST_RESET_AWAITING_EXPERIENCES',
    awaitingExperiences: genFetchTypes('HOST_AWAITING_EXPERIENCES'),
    awaitingExperiencesCounter: genFetchTypes('HOST_AWAITING_EXPERIENCES_COUNTER'),
    upcomingExperiences: genFetchTypes('HOST_UPCOMING_EXPERIENCES'),
    resetUpcomingExperiences: 'HOST_RESET_UPCOMING_EXPERIENCES',
    pastExperiences: genFetchTypes('HOST_PAST_EXPERIENCES'),
    resetPastExperiences: 'HOST_RESET_PAST_EXPERIENCES'
};

const defaultExperiencesState = {
    experiences: [],
    count: 0,
    next: null,
    prev: null
};

const defaultOrdersState = {
    orders: [],
    count: 0,
    next: null,
    prev: null
};

const hostExperiencesReducer = (state = defaultExperiencesState, { type, payload }) => {
    switch (type) {
    case types.hostExperiences.SUCCESS:
        const { count, next, prev } = payload;
        const hostExperiences = state.experiences.length ?
            state.experiences.concat(payload.results) :
            payload.results;
        return {
            ...state,
            count,
            next,
            prev,
            experiences: removeDupes(hostExperiences.filter(Boolean))
        };
    case types.hostExperiences.FAILURE:
        return { ...state, ...defaultExperiencesState };
    case types.resetExperiences:
        return { ...state, ...defaultExperiencesState };
    default:
        return state;
    }
};

const awaitingExperiencesReducer = (state = { response: [] }, { type, payload }) => {
    switch (type) {
    case types.awaitingExperiences.SUCCESS:
        return { ...state, response: payload };
    case types.resetAwaitingExperiences:
        return { ...state, response: [] };
    default:
        return state;
    }
};

const awaitingExperiencesCounterReducer = (state = { count: 0 }, { type, payload }) => {
    switch (type) {
    case types.awaitingExperiencesCounter.SUCCESS:
        return { ...state, count: payload };
    default:
        return state;
    }
};

const upcomingExperiencesReducer = (state = defaultOrdersState, { type, payload }) => {
    switch (type) {
    case types.upcomingExperiences.SUCCESS:
        const { count, next, prev } = payload;
        const hostOrders = state.orders.length ?
            state.orders.concat(payload.results) :
            payload.results;

        return {
            ...state,
            count,
            next,
            prev,
            orders: removeDupes(hostOrders.filter(Boolean))
        };
    case types.upcomingExperiences.FAILURE:
        return { ...state, ...defaultOrdersState };
    case types.resetUpcomingExperiences:
        return { ...state, ...defaultOrdersState };
    default:
        return state;
    }
};

const pastExperiencesReducer = (state = defaultOrdersState, { type, payload }) => {
    switch (type) {
    case types.pastExperiences.SUCCESS:
        const { count, next, prev } = payload;
        const hostOrders = state.orders.length ?
            state.orders.concat(payload.results) :
            payload.results;

        return {
            ...state,
            count,
            next,
            prev,
            orders: removeDupes(hostOrders.filter(Boolean))
        };
    case types.pastExperiences.FAILURE:
        return { ...state, ...defaultOrdersState };
    case types.resetPastExperiences:
        return { ...state, ...defaultOrdersState };
    default:
        return state;
    }
};

const flatten = list => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);

const awaitingExperiencesfromProperties = properties => (
    flatten(properties.map(result => (
        result.awaiting_responses.map((response) => {
            let obj = response;
            obj.property = result;
            return obj;
        })
    ))).sort((a, b) => (new Date(a.date_from).getTime() - new Date(b.date_from).getTime()))
);

const actions = {
    fetchExperiences: params => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.properties(params),
            actionTypes: types.hostExperiences,
            transform: ({ count, next, results }) => ({
                count,
                next,
                results: results.map(result => hostPropertiesTransform(result))
            })
        })
    ),

    resetExperiences: () => ({
        type: types.resetExperiences
    }),

    fetchAwaitingExperiences: params => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.properties(params),
            actionTypes: types.awaitingExperiences,
            transform: res => (awaitingExperiencesfromProperties(res.results)
                .map(awaitingResponse => hostAwaitingResponsesTransform(awaitingResponse))
            )
        })
    ),

    resetAwaitingExperiences: () => ({
        type: types.resetAwaitingExperiences
    }),

    fetchAwaitingExperiencesCounter: () => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.properties({ type: 'EXPERIENCE' }),
            actionTypes: types.awaitingExperiencesCounter,
            transform: res => (awaitingExperiencesfromProperties(res.results).length)
        })
    ),

    fetchUpcomingExperiences: params => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.orders(params),
            actionTypes: types.upcomingExperiences,
            transform: ({ count, next, results }) => ({
                count,
                next,
                results: results.map(result => hostOrderTransform(result))
            })
        })
    ),
    fetchUpcomingExperiencesByUrl: url => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.byUrl(url),
            actionTypes: types.upcomingExperiences,
            transform: ({ count, next, results }) => ({
                count,
                next,
                results: results.map(result => hostOrderTransform(result))
            })
        })
    ),
    resetUpcomingExperiences: () => ({
        type: types.resetUpcomingExperiences
    }),

    fetchPastExperiences: params => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.orders(params),
            actionTypes: types.pastExperiences,
            transform: ({ count, next, results }) => ({
                count,
                next,
                results: results.map(result => hostOrderTransform(result))
            })
        })
    ),
    fetchPastExperiencesByUrl: url => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.byUrl(url),
            actionTypes: types.pastExperiences,
            transform: ({ count, next, results }) => ({
                count,
                next,
                results: results.map(result => hostOrderTransform(result))
            })
        })
    ),
    resetPastExperiences: () => ({
        type: types.resetPastExperiences
    })
};

const getFns = {
    getExperiences: state => state.hostExperiences,
    getExperience: (state, id) => state.hostExperiences.experiences.find(obj => obj.id === id),
    isExperienceLoading: state => state.fetchExperiencesState.isFetching,
    getAwaitingExperiences: state => state.awaitingExperiences.response,
    isAwaitingExperiencesLoading: state => state.awaitingExperiencesState.isFetching,
    getAwaitingExperiencesCounter: state => state.awaitingExperiencesCounter.count,
    getUpcomingExperiences: state => state.upcomingExperiences,
    isUpcomingExperiencesLoading: state => state.upcomingExperiencesState.isFetching,
    getPastExperiences: state => state.pastExperiences,
    isPastExperiencesLoading: state => state.pastExperiencesState.isFetching
};

export default {
    actions,
    get: getFns,
    reducer: combineReducers({
        hostExperiences: hostExperiencesReducer,
        fetchExperiencesState: requestStateReducer(types.hostExperiences),
        awaitingExperiences: awaitingExperiencesReducer,
        awaitingExperiencesState: requestStateReducer(types.awaitingExperiences),
        awaitingExperiencesCounter: awaitingExperiencesCounterReducer,
        upcomingExperiences: upcomingExperiencesReducer,
        upcomingExperiencesState: requestStateReducer(types.upcomingExperiences),
        pastExperiences: pastExperiencesReducer,
        pastExperiencesState: requestStateReducer(types.pastExperiences)
    })
};
