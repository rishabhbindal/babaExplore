import { combineReducers } from 'redux';

import { HomePage } from './../lib/api.js';
import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';
import { eventTransform } from './../data-shapes/events';
import {
    promotedListTransform,
    newsItemTransform,
    homePagePropertyTransform,
    homePageGroupTransform,
    supportedCitiesTransform,
    specialEventTransform
} from './../data-shapes/homePage';

import removeDupes from '../lib/removeDupes.js';

export const types = {
    promotedList: genFetchTypes('PROMOTED_LIST'),
    promotedListPress: genFetchTypes('PROMOTED_LIST_PRESS'),
    promotedListProperty: genFetchTypes('PROMOTED_LIST_PROPERTY'),
    promotedListEvent: genFetchTypes('PROMOTED_LIST_EVENT'),
    promotedListGroup: genFetchTypes('PROMOTED_LIST_GROUP'),
    supportedCities: genFetchTypes('SUPPORTED_CITIES')

};

const compareSupportedCities = (a, b) => {
    if (a.location < b.location) {
        return -1;
    }
    if (a.location > b.location) {
        return 1;
    }
    return 0;
};

const supportedCitiesReducer = (state = { cityItems: [] }, { type, payload }) => {
    switch (type) {
    case types.supportedCities.SUCCESS:
        const cityItems = state.cityItems.length ? state.cityItems.concat(payload) : payload;
        return { ...state, cityItems: removeDupes(cityItems.filter(Boolean)).sort(compareSupportedCities) };
    case types.supportedCities.FAILURE:
        return { ...state, cityItems: [] };
    default:
        return state;
    }
};

const promotedListReducer = (state = {}, { type, payload }) => {
    switch (type) {
    case types.promotedList.SUCCESS:
        // TODO: remove code made redundant by consolidation of all info in single api call
        return {
            ...state,
            ...payload,
            properties: payload.properties.map(homePagePropertyTransform),
            groups: payload.groups.map(homePageGroupTransform),
            press: payload.press.map(newsItemTransform),
            events: payload.events[0] && specialEventTransform(payload.events[0])
        };
    default:
        return state;
    }
};

const newsItemReducer = (state = { newsItems: [] }, { type, payload }) => {
    switch (type) {
    case types.promotedListPress.SUCCESS:
        const newsItems = state.newsItems.length ? state.newsItems.concat(payload) : [payload];
        return { ...state, newsItems: removeDupes(newsItems.filter(Boolean)) };
    default:
        return state;
    }
};

const propertyReducer = (state = { list: [] }, { type, payload }) => {
    switch (type) {
    case types.promotedListProperty.SUCCESS:
        const list = state.list.length ? state.list.concat(payload) : [payload];
        return { ...state, list: removeDupes(list.filter(Boolean)) };
    default:
        return state;
    }
};

const eventReducer = (state = { eventItems: [] }, { type, payload }) => {
    switch (type) {
    case types.promotedListEvent.SUCCESS:
        const eventItems = state.eventItems.length ? state.eventItems.concat(payload) : [payload];
        return { ...state, eventItems: removeDupes(eventItems.filter(Boolean)) };
    default:
        return state;
    }
};

const groupReducer = (state = { groupItems: [] }, { type, payload }) => {
    switch (type) {
    case types.promotedListGroup.SUCCESS:
        const groupItems = state.groupItems.length ? state.groupItems.concat(payload) : [payload];
        return { ...state, groupItems: removeDupes(groupItems.filter(Boolean)) };
    default:
        return state;
    }
};

const actions = {
    fetchSupportedCities: () => dispatch => dispatch(
      simpleJSONFetchDispatcher({
          promiseFn: () => HomePage.supportedCities(),
          actionTypes: types.supportedCities,
          transform: res => res.results.map(result => supportedCitiesTransform(result))
      })
    ),

    fetchPromotedList: caption => dispatch => dispatch(
      simpleJSONFetchDispatcher({
          promiseFn: () => HomePage.promotedList(caption),
          actionTypes: types.promotedList,
          transform: res => promotedListTransform(res.results[0])
      })
    ),

    fetchPress: url => dispatch => dispatch(
      simpleJSONFetchDispatcher({
          promiseFn: () => HomePage.byUrl(url),
          actionTypes: types.promotedListPress,
          transform: res => newsItemTransform(res)
      })
    ),

    fetchProperties: url => dispatch => dispatch(
      simpleJSONFetchDispatcher({
          promiseFn: () => HomePage.byUrl(url),
          actionTypes: types.promotedListProperty,
          transform: res => homePagePropertyTransform(res)
      })
    ),

    fetchEvents: url => dispatch => dispatch(
      simpleJSONFetchDispatcher({
          promiseFn: () => HomePage.byUrl(url),
          actionTypes: types.promotedListEvent,
          transform: res => eventTransform(res)
      })
    ),

    fetchGroups: url => dispatch => dispatch(
      simpleJSONFetchDispatcher({
          promiseFn: () => HomePage.byUrl(url),
          actionTypes: types.promotedListGroup,
          transform: res => homePageGroupTransform(res)
      })
    )
};

const getFns = {
    getPromotedList: state => state.promotedList,
    getSupportedCities: state => state.supportedCities
};

export default {
    actions,
    get: getFns,
    reducer: combineReducers({
        supportedCities: supportedCitiesReducer,
        promotedList: promotedListReducer,
        news: newsItemReducer,
        properties: propertyReducer,
        events: eventReducer,
        groups: groupReducer
    })
};
