import moment from 'moment';
import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';

import { Property } from '../lib/api.js';
import removeDupes from '../lib/removeDupes.js';

import { userTransform } from './../data-shapes/user.js';

export const types = {
    guestsFetch: genFetchTypes('GUESTS_FETCH')
};

const guestsReducer = (state = { list: [], withDupes: [] }, { type, payload }) => {
    switch (type) {
    case types.guestsFetch.SUCCESS:
        const withDupes = state.withDupes.concat(payload.list);
        const list = removeDupes(withDupes);
        return { ...state, list, withDupes };
    default:
        return state;
    }
};

const getFns = {
    getGuests: state => state.list
};

const actions = {
    fetchGuests: (id, eventDate, next) => dispatch =>
        dispatch(simpleJSONFetchDispatcher({
            promiseFn: () => Property.getGuests(id, moment(eventDate).format('YYYY-MM-DD'), next),
            actionTypes: types.guestsFetch,
            transform: res => ({
                list: res.results.map(u => u.user_info).map(userTransform),
                next: res.next
            }),
            returnResponse: true
        })).then((res) => {
            res.next && dispatch(actions.fetchGuests(id, eventDate, res.next));
        })
};

export default {
    reducer: guestsReducer,
    actions,
    get: getFns
};
