import moment from 'moment';
import { combineReducers } from 'redux';

import { Property } from './../lib/api.js';
import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';
import requestStateReducer from '../lib/requestReducerHelper.js';

import { eventPropertyTransform } from './../data-shapes/property';
import { reviewTransform } from './../data-shapes/review.js';
import { userTransform } from './../data-shapes/user.js';

import { getState as appState } from './index.js';

import removeDupes from '../lib/removeDupes.js';

export const types = {
    eventListingFetch: genFetchTypes('EVENT_LISTING'),
    eventListingAvailability: genFetchTypes('EVENT_LISTING_AVAILABILITY'),
    eventListingGuestsFetch: genFetchTypes('EVENT_LISTING_GUESTS'),
    eventsListingReviewsFetch: genFetchTypes('EVENT_LISTING_REVIEWS'),
    cancellationPoliciesFetch: genFetchTypes('CANCELLATION_POLICIES'),
    waitingListStatusFetch: genFetchTypes('WAITING_LIST'),
    joinWaitingListFetch: genFetchTypes('JOIN_WAITING_LIST'),
    fetchMoreGuests: genFetchTypes('FETCH_MORE_GUESTS')
};

const listingReducer = (state = {}, { type, id, payload }) => {
    switch (type) {
    case types.eventListingFetch.SUCCESS:
        return { ...state, [id]: payload };
    case types.eventListingFetch.FAILURE:
        return { ...state, [id]: null };
    case types.eventListingAvailability.SUCCESS:
        return {
            ...state,
            [id]: {
                ...state[id] || {},
                bookables: payload // TODO: this needs to be better
            }
        };
    default:
        return state;
    }
};

const guestReducer = (state = { guestList: [] }, { type, payload }) => {
    switch (type) {
    case types.eventListingGuestsFetch.SUCCESS:
        return { ...state, guestList: removeDupes(payload.guests) };
    case types.fetchMoreGuests.SUCCESS:
        const guestList = removeDupes(state.guestList.concat(payload.guests));
        return { ...state, guestList };
    default:
        return state;
    }
};

const reviewsReducer = (state = { reviews: [] }, { type, payload }) => {
    switch (type) {
    case types.eventsListingReviewsFetch.SUCCESS:
        const reviews = payload.reviews;
        return { ...state, reviews };
    case types.eventsListingReviewsFetch.FAILURE:
        return { ...state, reviews: [] };
    default:
        return state;
    }
};

const cancellationPoliciesReducer = (state = null, { type, payload }) => {
    switch (type) {
    case types.cancellationPoliciesFetch.SUCCESS:
        const policies = state ? state.concat(payload.policies) : payload.policies;
        return policies;
    case types.cancellationPoliciesFetch.FAILURE:
        return state;
    default:
        return state;
    }
};

const waitingListReducer = (state = {}, { type }) => {
    switch (type) {
    case types.waitingListStatusFetch.PENDING:
        return { loading: true };
    case types.waitingListStatusFetch.SUCCESS:
        return { joined: true, loading: false };
    case types.waitingListStatusFetch.FAILURE:
        return { loading: false };
    default:
        return state;
    }
};

const actions = {
    fetchEventListing: id =>
        simpleJSONFetchDispatcher({
            id,
            promiseFn: () => Property.get({code: id}),
            actionTypes: types.eventListingFetch,
            transform: res => eventPropertyTransform(res.results[0])
        }),
    fetchGuests: (id, eventDate, next) => dispatch =>
        dispatch(simpleJSONFetchDispatcher({
            promiseFn: () => Property.getGuests(id, moment(eventDate).format('YYYY-MM-DD'), next),
            actionTypes: next ? types.fetchMoreGuests : types.eventListingGuestsFetch,
            transform: res => ({
                guests: res.results.map(u => u.user_info).map(userTransform),
                next: res.next
            }),
            returnResponse: true
        })).then((res) => {
            res.next && dispatch(actions.fetchGuests(id, eventDate, res.next));
        }),
    fetchEventListingAvailability: (code, id, eventDate) => (dispatch, getState) => {
        return dispatch(simpleJSONFetchDispatcher({
            id: code,
            promiseFn: () => Property.getAvailability(id, moment(eventDate).format('YYYY-MM-DD')),
            actionTypes: types.eventListingAvailability,
            transform: (res) => {
                const { bookables } = appState.event.getProperty(getState(), code) || {};
                return bookables.map((b) => {
                    const { available } = res[b.bookableInstanceLabel] || {};
                    return {
                        ...b,
                        availableInstances: available
                    };
                });
            }
        }));
    },
    fetchReviews: (id, next) => dispatch =>
        dispatch(simpleJSONFetchDispatcher({
            promiseFn: () => Property.getReviews(id, next),
            actionTypes: types.eventsListingReviewsFetch,
            transform: res => ({
                reviews: res.results.map(reviewTransform),
                next: res.next
            }),
            returnResponse: true
        })).then((res) => {
            res.next && dispatch(actions.fetchReviews(id, res.next));
        }),
    fetchCancellationPolicies: next => dispatch =>
        dispatch(simpleJSONFetchDispatcher({
            promiseFn: () => Property.getCancellationPolicies(next),
            actionTypes: types.cancellationPoliciesFetch,
            transform: res => ({
                policies: res.results,
                next: res.next
            }),
            returnResponse: true
        })).then((res) => {
            res.next && dispatch(actions.getCancellationPolicies(res.next));
        }),
    fetchWaitingListStatus: bookableId => simpleJSONFetchDispatcher({
        promiseFn: () => Property.fetchWaitingListStatus(bookableId),
        actionTypes: types.waitingListStatusFetch,
        returnResponse: true
    }),
    joinWaitingList: (email, bookableId) => simpleJSONFetchDispatcher({
        promiseFn: () => Property.joinWaitingList(email, bookableId),
        actionTypes: types.joinWaitingListFetch,
        returnResponse: true
    })
};

const getFns = {
    getProperty: (state, propertyCode) => state.listings[propertyCode],
    getAvailability: (state, propertyCode) =>
        state.listings[propertyCode] &&
        state.listings[propertyCode].availableInstances,
    getReviews: state => state.reviews.reviews,
    getGuests: state => state.guests && state.guests.guestList,
    getReviewsByOrderId: (state, orderId) => state.reviews.reviews.find(review => `${review.orderId}` === `${orderId}`),
    getCancellationPolicies: state => state.cancellationPolicies,
    getWaitingList: state => state.waitingList
};

export default {
    reducer: combineReducers({
        listingFetchState: requestStateReducer(types.eventListingFetch),
        listings: listingReducer,
        guestsFetchState: requestStateReducer(types.eventListingGuestsFetch),
        guests: guestReducer,
        reviewsFetchState: requestStateReducer(types.eventsListingReviewsFetch),
        reviews: reviewsReducer,
        cancellationPolicies: cancellationPoliciesReducer,
        waitingList: waitingListReducer
    }),
    actions,
    get: getFns
};
