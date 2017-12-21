import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';
import capitalize from './../../lib/capitalize.es6.js';
import { compareLoc, capitalizeLoc } from '../../lib/locationHelpers.es6.js';
import { AppConfig, Groups, CancellationPolicy } from '../lib/api.js';
import removeDupes from '../lib/removeDupes.js';
import { groupTransform } from '../data-shapes/group.js';
import { imageSetTransform } from '../data-shapes/image.js';

export const types = {
    appConfigFetch: genFetchTypes('APP_CONFIG'),
    groupsListFetch: genFetchTypes('GROUPS_LIST'),
    cancellationPolicyFetch: genFetchTypes('CANCELLATION_POLICY_FETCH'),
    allGroupsDetailsFetch: genFetchTypes('ALL_GROUPS_DETAILS')
};

const defaultState = {
    config: {},
    supported_cities: [],
    groups: [],
    allGroupsDetails: []
};

const appConfigReducer = (state = defaultState, { type, payload }) => {
    switch (type) {
    case types.appConfigFetch.SUCCESS:
        return {
            ...state,
            supported_cities: payload.supported_cities || [],
            config: payload.default_configuration
        };
    case types.groupsListFetch.SUCCESS:
        const groups = removeDupes(state
            .groups
            .concat(payload)
        );
        return { ...state, groups };
    case types.allGroupsDetailsFetch.SUCCESS:
        const allGroupsDetails = removeDupes(state
            .allGroupsDetails
            .concat(payload)
            .filter(g => g.status.toLowerCase() === 'published')
        );
        return { ...state, allGroupsDetails };
    default:
        return state;
    }
};

const actions = {
    fetchAppConfig: () =>
        simpleJSONFetchDispatcher({
            promiseFn: () => AppConfig.get(),
            actionTypes: types.appConfigFetch
        }),
    fetchGroups: () =>
        simpleJSONFetchDispatcher({
            promiseFn: () => Groups.getList(),
            actionTypes: types.groupsListFetch,
            transform: resp => resp.results.map(r => ({ ...r, image: imageSetTransform(r.image || {}) }))
        }),
    fetchCancellationPolicy: name =>
        simpleJSONFetchDispatcher({
            promiseFn: () => CancellationPolicy.get(name),
            actionTypes: types.cancellationPolicyFetch,
            returnResponse: true,
            transform: res => res.results[0]
        }),
    fetchAllGroupDetails: () =>
        simpleJSONFetchDispatcher({
            promiseFn: () => Groups.get(),
            actionTypes: types.allGroupsDetailsFetch,
            transform: resp => resp.results && resp.results.map(g => groupTransform(g))
        })
};

const getFns = {
    getServiceChargeRate: state =>
        state.config.service_charge_pct,
    cities: state => state.supported_cities
        .map(c => Object.assign({}, { city: c.city, state: c.state }))
        .sort(compareLoc)
        .map(capitalizeLoc),
    cityNames: state => state.supported_cities
        .map(cityObj => cityObj.city || cityObj.state).map(capitalize).sort(),
    group: (state, groupName = '') => state.groups.find(group => (group.name.toLowerCase() === groupName.toLowerCase())),
    groups: state => state.groups,
    groupNames: state => state.groups.map(gObj => gObj.name).map(capitalize),
    allGroupsDetails: state => state.allGroupsDetails
};

export default {
    actions,
    get: getFns,
    reducer: appConfigReducer
};
