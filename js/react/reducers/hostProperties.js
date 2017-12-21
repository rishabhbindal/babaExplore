import { combineReducers } from 'redux';

import { Host, HomePage } from './../lib/api.js';
import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';
import requestStateReducer from '../lib/requestReducerHelper.js';
import { orderStateTransform } from './../data-shapes/order';
import removeDupes from '../lib/removeDupes.js';
import {
    hostAwaitingResponsesTransform,
    hostPropertiesTransform,
    hostBookableTransform
} from './../data-shapes/hostProperties';
import hostOrderTransform from './../data-shapes/HostOrder';


export const types = {
    hostProperties: genFetchTypes('HOST_PROPERTIES'),
    resetProperties: 'RESET_HOST_PROPERTIES',
    hostPropertiesAutocomplete: genFetchTypes('HOST_PROPERTIES_AUTOCOMPLETE'),
    resetPropertiesAutocomplete: 'RESET_HOST_PROPERTIES_AUTOCOMPLETE',
    upcomingOrders: genFetchTypes('HOST_UPCOMING_ORDERS'),
    resetUpcomingOrders: genFetchTypes('HOST_RESET_UPCOMING_ORDERS'),
    pastOrders: genFetchTypes('HOST_PAST_ORDERS'),
    resetPastOrders: genFetchTypes('HOST_RESET_PAST_ORDERS'),
    hostOrder: genFetchTypes('HOST_ORDER'),
    updateProperties: genFetchTypes('HOST_UPDATE_PROPERTIES'),
    updateBookables: genFetchTypes('HOST_UPDATE_BOOKABLES'),
    hostAwaitingResponses: genFetchTypes('HOST_AWAITING_RESPONSES'),
    hostAwaitingResponsesCounter: genFetchTypes('HOST_AWAITING_RESPONSES_COUNTER'),
    resetAwaitingResponses: 'HOST_RESET_AWAITING_RESPONSES',
    submitAwaitingResponse: genFetchTypes('HOST_SUBMIT_AWAITING_RESPONSE'),
    emailOrderHistory: genFetchTypes('HOST_EMAIL_ORDER_HISTORY')
};

const defaultOrdersState = {
    orders: [],
    count: 0,
    next: null,
    prev: null
};

const hostOrderReducer = (state = {}, { type, payload }) => {
    switch (type) {
    case types.hostOrder.SUCCESS:
        return { ...state, ...payload };
    default:
        return state;
    }
};

const awaitingResponsesReducer = (state = { response: [] }, { type, payload }) => {
    switch (type) {
    case types.hostAwaitingResponses.SUCCESS:
        return { ...state, response: payload };
    case types.resetAwaitingResponses:
        return { ...state, response: [] };
    default:
        return state;
    }
};

const awaitingResponsesCounterReducer = (state = { count: 0 }, { type, payload }) => {
    switch (type) {
    case types.hostAwaitingResponsesCounter.SUCCESS:
        return { ...state, count: payload };
    default:
        return state;
    }
};

const hostPropertiesReducer = (state = { properties: [], count: 0, next: null }, { type, payload }) => {
    switch (type) {
    case types.updateBookables.SUCCESS:
        const properties = state.properties.map((property) => {
            if (property.url === payload.property) {
                const { bookableItems } = property;
                return {
                    ...property,
                    bookableItems: bookableItems.map(item => (item.url === payload.url) ? payload : item)
                };
            }
            return property;
        });
        return {
            ...state,
            properties
        };
    case types.hostProperties.SUCCESS:
        const hostProperties = state.properties.length ? state.properties.concat(payload.results) : payload.results;
        const count = payload.count;
        const next = payload.next;

        return {
            ...state,
            count,
            next,
            properties: removeDupes(hostProperties.filter(Boolean))
        };
    case types.hostProperties.FAILURE:
        return { ...state, properties: [], count: 0, next: false };
    case types.resetProperties:
        return { ...state, properties: [], count: 0, next: false };
    default:
        return state;
    }
};

const hostPropertiesAutocompleteReducer = (state = { properties: [] }, { type, payload }) => {
    switch (type) {
    case types.hostPropertiesAutocomplete.SUCCESS:
        return { ...state, properties: payload };
    case types.hostPropertiesAutocomplete.FAILURE:
        return { ...state, properties: [] };
    case types.resetPropertiesAutocomplete:
        return { ...state, properties: [] };
    default:
        return state;
    }
};

const upcomingOrdersReducer = (state = defaultOrdersState, { type, payload }) => {
    switch (type) {
    case types.upcomingOrders.SUCCESS:
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
    case types.upcomingOrders.FAILURE:
        return { ...state, ...defaultOrdersState };
    case types.resetUpcomingOrders:
        return { ...state, ...defaultOrdersState };
    default:
        return state;
    }
};

const pastOrdersReducer = (state = defaultOrdersState, { type, payload }) => {
    switch (type) {
    case types.pastOrders.SUCCESS:
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
    case types.pastOrders.FAILURE:
        return { ...state, ...defaultOrdersState };
    case types.resetPastOrders:
        return { ...state, ...defaultOrdersState };
    default:
        return state;
    }
};

const flatten = list => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);

const awaitingResponsesfromProperties = properties => (
    flatten(properties.map(result => (
        result.awaiting_responses.map((response) => {
            let obj = response;
            obj.property = result;
            return obj;
        })
    ))).sort((a, b) => (new Date(a.date_from).getTime() - new Date(b.date_from).getTime()))
);

const actions = {
    fetchUpcomingOrdersByUrl: url => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => HomePage.byUrl(url),
            actionTypes: types.upcomingOrders,
            transform: ({ count, next, results }) => ({
                count,
                next,
                results: results.map(result => hostOrderTransform(result))
            })
        })
    ),
    fetchUpcomingOrders: params => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.orders(params),
            actionTypes: types.upcomingOrders,
            transform: ({ count, next, results }) => ({
                count,
                next,
                results: results.map(result => hostOrderTransform(result))
            })
        })
    ),
    resetUpcomingOrders: () => ({
        type: types.resetUpcomingOrders
    }),

    fetchPastOrdersByUrl: url => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => HomePage.byUrl(url),
            actionTypes: types.pastOrders,
            transform: ({ count, next, results }) => ({
                count,
                next,
                results: results.map(result => hostOrderTransform(result))
            })
        })
    ),
    fetchPastOrders: params => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.orders(params),
            actionTypes: types.pastOrders,
            transform: ({ count, next, results }) => ({
                count,
                next,
                results: results.map(result => hostOrderTransform(result))
            })
        })
    ),
    resetPastOrders: () => ({
        type: types.resetPastOrders
    }),

    fetchOrder: url => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => HomePage.byUrl(url),
            actionTypes: types.hostOrder,
            transform: res => orderStateTransform(res)
        })
    ),

    fetchPropertiesAutocomplete: params => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.properties(params),
            actionTypes: types.hostPropertiesAutocomplete,
            transform: ({ results }) => results.map(property => ({
                label: property.caption,
                value: property.id,
                code: property.code
            }))
        })
    ),
    resetPropertiesAutocomplete: () => ({
        type: types.resetPropertiesAutocomplete
    }),

    fetchProperties: params => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.properties(params),
            actionTypes: types.hostProperties,
            transform: ({ count, next, results }) => ({
                count,
                next,
                results: results.map(result => hostPropertiesTransform(result))
            })
        })
    ),

    resetProperties: () => ({
        type: types.resetProperties
    }),

    updateProperties: (url, params) => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.put(url, params),
            actionTypes: types.updateProperties,
            transform: res => hostPropertiesTransform(res),
            returnResponse: true
        })
    ),

    updateBookables: (url, params) => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.put(url, params),
            actionTypes: types.updateBookables,
            transform: res => hostBookableTransform(res),
            returnResponse: true
        })
    ),

    fetch: params => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.properties(params),
            actionTypes: types.hostAwaitingResponses,
            transform: res => (awaitingResponsesfromProperties(res.results)
                .map(awaitingResponse => hostAwaitingResponsesTransform(awaitingResponse))
            )
        })
    ),

    fetchAwaitingResponsesCounter: () => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.properties({ type: 'ACCOMMODATION' }),
            actionTypes: types.hostAwaitingResponsesCounter,
            transform: res => (awaitingResponsesfromProperties(res.results).length)
        })
    ),

    resetAwaitingResponses: () => ({
        type: types.resetAwaitingResponses
    }),

    emailOrderHistory: params => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.emailOrderHistory(params),
            actionTypes: types.emailOrderHistory
        })
    ),

    submitAwaitingResponse: (url, params) => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Host.post(url, params),
            actionTypes: types.submitAwaitingResponse,
            transform: res => res,
            returnResponse: true
        })
    )
};

const getFns = {
    getAwaitingResponses: state => state.awaitingResponses.response,
    getAwaitingResponsesCounter: state => state.awaitingResponsesCounter.count,
    getProperties: state => state.hostProperties,
    getPropertiesAutocomplete: state => state.hostPropertiesAutocomplete.properties,
    getProperty: (state, id) => state.hostProperties.properties.find(property => property.id === id),
    isFetching: state => state.fetchAwaitingResponsesState.isFetching,
    isPropertiesFetching: state => state.fetchHostPropertiesState.isFetching,
    isPropertyUpdating: state => state.fetchUpdatePropertyState.isFetching,
    isBookableUpdating: state => state.fetchUpdateBookableState.isFetching,
    getUpcomingOrders: state => state.upcomingOrders,
    isUpcomingOrdersLoading: state => state.upcomingOrdersState.isFetching,
    getPastOrders: state => state.pastOrders,
    isPastOrdersLoading: state => state.pastOrdersState.isFetching,
    getOrder: state => state.hostOrder,
    emailOrderHistoryPosting: state => state.emailOrderHistoryState.isFetching
};

export default {
    actions,
    get: getFns,
    reducer: combineReducers({
        hostProperties: hostPropertiesReducer,
        hostPropertiesAutocomplete: hostPropertiesAutocompleteReducer,
        awaitingResponses: awaitingResponsesReducer,
        awaitingResponsesCounter: awaitingResponsesCounterReducer,
        upcomingOrders: upcomingOrdersReducer,
        upcomingOrdersState: requestStateReducer(types.upcomingOrders),
        pastOrders: pastOrdersReducer,
        pastOrdersState: requestStateReducer(types.pastOrders),
        fetchUpdateBookableState: requestStateReducer(types.updateBookables),
        fetchUpdatePropertyState: requestStateReducer(types.updateProperties),
        fetchAwaitingResponsesState: requestStateReducer(types.hostAwaitingResponses),
        fetchHostPropertiesState: requestStateReducer(types.hostProperties),
        emailOrderHistoryState: requestStateReducer(types.emailOrderHistory),
        hostOrder: hostOrderReducer
    })
};
