import { combineReducers } from 'redux';

import { actions as appActions, getState as appState } from '../reducers';
import { HostOrder } from './../lib/api.js';
import hostOrderTransform from '../data-shapes/HostOrder.js';

import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';
import { toInt } from '../lib/helpers.js';
import idFromURLEnd from '../lib/idFromURLEnd.js';
import analytics from '../../lib/analytics.es6.js';
import { parseQuery } from '../lib/queryString.js';

const types = {
    hostOrderFetch: genFetchTypes('HOST_ORDER_FETCH'),
    updateOrderFetch: genFetchTypes('UPDATE_HOST_ORDER'),
    selectDownPayment: 'HOST_ORDER_DOWNPAYMENT'
};

const hostOrderRedcuer = (state = null, { type, payload }) => {
    switch (type) {
    case types.hostOrderFetch.SUCCESS:
        return { details: payload };
    case types.hostOrderFetch.FAILURE:
        return { ...state, orderFetchFailure: true };
    case types.updateOrderFetch.SUCCESS:
        return { ...state, details: payload, updateSucceeded: true };
    case types.updateOrderFetch.FAILURE:
        return { ...state, updateFailed: true };
    case types.selectDownPayment:
        return { ...state, downpayment: payload };
    default:
        return state;
    }
};

const getAmountPaid = (isDownpayment, gateway, hostOrder) => {
    if (!gateway) {
        return isDownpayment ? hostOrder.downpayment : hostOrder.amount;
    }
    return isDownpayment ? hostOrder.downpaymentInUSD : hostOrder.amountInUSD;
};

const actions = {
    fetchHostOrder: (ref, code) =>
        simpleJSONFetchDispatcher({
            promiseFn: () => HostOrder.getHostOrder(ref, code),
            actionTypes: types.hostOrderFetch,
            transform: res => hostOrderTransform(res.results[0]),
            returnResponse: true
        }),
    openPayment: () => (dispatch, getState) => {
        const state = getState();

        const { ref, code } = parseQuery(location.search);
        const hostOrder = appState.hostOrder.getHostOrder(state);
        const user = appState.user.getUserByURL(state, hostOrder.owner);
        const isDownpayment = appState.hostOrder.isDownpayment(state);
        const { property } = hostOrder;

        const propertyDetails = {
            name: property.caption,
            description: property.caption,
            image: property.images[0].small
        };

        const userDetails = {
            name: user.name,
            email: user.email,
            contact: user.phone
        };

        if (toInt(hostOrder.amount) === 0) {
            dispatch(appActions.hostOrder.updateOrder('No amount due', __PAY_ZERO_GATEWAY__));
            return;
        }

        const amount = isDownpayment ? hostOrder.downpayment : hostOrder.amount;

        const options = {
            key: __PAY_RAZOR_PAY_KEY__,
            amount: Math.ceil(amount * 100),
            currency: 'INR',
            ...propertyDetails,
            notes: {
                elt_order_id: idFromURLEnd(hostOrder.url)
            },
            prefill: userDetails,
            theme: {
                color: '#F37254'
            },
            handler: ({ razorpay_payment_id }) => {
                analytics.fbpTrack('Purchase', {
                    value: hostOrder.amount,
                    currency: 'INR',
                    content_name: property && property.code
                });
                analytics.event({
                    eventCategory: 'Host Order Booking',
                    eventAction: 'Booking Completed',
                    eventLabel: property && property.caption,
                    eventValue: parseInt(hostOrder.amount, 10)
                });
                dispatch(appActions.hostOrder.updateOrder(razorpay_payment_id));
            },
            modal: {
                ondismiss: () => {}
            }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
    },
    updateOrder: (receiptInfo, gateway) => (dispatch, getState) => {
        const state = getState();
        const { ref, code } = parseQuery(location.search);
        const hostOrder = appState.hostOrder.getHostOrder(state);
        const id = idFromURLEnd(hostOrder.url);
        const isDownpayment = appState.hostOrder.isDownpayment(state);

        const params = {
            amount_paid: isDownpayment ? hostOrder.downpayment : hostOrder.amount,
            amount_paid: getAmountPaid(isDownpayment, gateway, hostOrder),
            payment_gateway: gateway || __PAY_BACKEND_GATEWAY__,
            receipt_information: receiptInfo
        };

        return dispatch(simpleJSONFetchDispatcher({
            promiseFn: () => HostOrder.updateOrder(ref, code, params, id),
            actionTypes: types.updateOrderFetch,
            transform: res => hostOrderTransform(res),
            returnResponse: true
        }));
    },
    selectDownPayment: val => dispatch => dispatch({
        type: types.selectDownPayment,
        payload: val
    })
};

const getFns = {
    getHostOrder: state => state.order && state.order.details,
    getFetchFailureStatus: state => state.order && state.order.orderFetchFailure,
    getHostOrderUpdateStatus: state => state.order.updateSucceeded,
    isDownpayment: state => state && state.order && state.order.downpayment
};

export default {
    reducer: combineReducers({
        order: hostOrderRedcuer
    }),
    actions,
    get: getFns
};
