import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import * as API from '../lib/api.js';

import coupon from './coupon.js';
import eventListing from './eventListing.js';
import user from './user.js';
import login from './login.js';
import order from './order.js';
import phone from './phone.js';
import session from './session.js';
import appConfig from './appConfig.js';
import modals from './modals.js';
import guests from './guests.js';
import events from './events.js';
import homePage from './homePage.js';
import propertyListing from './propertyListing.js';
import hostProperties from './hostProperties.js';
import hostExperiences from './hostExperiences.js';
import hostCreateOrder from './hostCreateOrder.js';
import hostOrder from './HostOrder.js';
import community from './community.js';
import review from './review.js';

export const reducers = combineReducers({
    appConfig: appConfig.reducer,
    coupon: coupon.reducer,
    event: eventListing.reducer,
    form: formReducer,
    login: login.reducer,
    modals: modals.reducer,
    phone: phone.reducer,
    session: session.reducer,
    user: user.reducer,
    order: order.reducer,
    guests: guests.reducer,
    homePage: homePage.reducer,
    events: events.reducer,
    property: propertyListing.reducer,
    hostProperties: hostProperties.reducer,
    hostExperiences: hostExperiences.reducer,
    hostCreateOrder: hostCreateOrder.reducer,
    hostOrder: hostOrder.reducer,
    community: community.reducer,
    review: review.reducer
});

export const actions = {
    appConfig: appConfig.actions,
    coupon: coupon.actions,
    event: eventListing.actions,
    login: login.actions,
    order: order.actions,
    modals: modals.actions,
    phone: phone.actions,
    session: session.actions,
    user: user.actions,
    guests: guests.actions,
    homePage: homePage.actions,
    events: events.actions,
    property: propertyListing.actions,
    hostProperties: hostProperties.actions,
    hostExperiences: hostExperiences.actions,
    hostCreateOrder: hostCreateOrder.actions,
    hostOrder: hostOrder.actions,
    community: community.actions,
    review: review.actions
};
export const appActions = actions;

const mapGetState = (gets, subState) => Object.entries(gets)
      .map(([key, fn]) =>
           [key, (state, ...args) => fn(state[subState], ...args)])
      .reduce((acc, [key, fn]) => ({ ...acc, ...{ [key]: fn } }), {});

export const getState = {
    appConfig: mapGetState(appConfig.get, 'appConfig'),
    coupon: mapGetState(coupon.get, 'coupon'),
    event: mapGetState(eventListing.get, 'event'),
    order: mapGetState(order.get, 'order'),
    modals: mapGetState(modals.get, 'modals'),
    phone: mapGetState(phone.get, 'phone'),
    session: mapGetState(session.get, 'session'),
    user: mapGetState(user.get, 'user'),
    guests: mapGetState(guests.get, 'guests'),
    homePage: mapGetState(homePage.get, 'homePage'),
    events: mapGetState(events.get, 'events'),
    property: mapGetState(propertyListing.get, 'property'),
    hostProperties: mapGetState(hostProperties.get, 'hostProperties'),
    hostExperiences: mapGetState(hostExperiences.get, 'hostExperiences'),
    hostCreateOrder: mapGetState(hostCreateOrder.get, 'hostCreateOrder'),
    hostOrder: mapGetState(hostOrder.get, 'hostOrder'),
    community: mapGetState(community.get, 'community'),
    review: mapGetState(review.get, 'review')
};
export const appState = getState;
