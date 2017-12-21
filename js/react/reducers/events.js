import { combineReducers } from 'redux';

import { Event } from './../lib/api.js';
import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';
import requestStateReducer from '../lib/requestReducerHelper.js';

import { eventTransform } from './../data-shapes/events';

export const types = {
    events: genFetchTypes('EVENTS')
};

const eventReducer = (state = {}, { type, payload }) => {
    switch (type) {
    case types.events.SUCCESS:
        return { ...state, ...payload };
    default:
        return state;
    }
};

const actions = {
    fetchEvents: params => dispatch => dispatch(
      simpleJSONFetchDispatcher({
          promiseFn: () => Event.get(params),
          actionTypes: types.events,
          transform: res => ({
              ...res,
              results: res.results.map(event => eventTransform(event))
          })
      })
    )
};

const getFns = {
    getEvents: state => state.events,
    isEventsLoading: state => state.fetchEventsState.isFetching
};

export default {
    actions,
    get: getFns,
    reducer: combineReducers({
        events: eventReducer,
        fetchEventsState: requestStateReducer(types.events)
    })
};
