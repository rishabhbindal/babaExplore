import moment from 'moment';
import { combineReducers } from 'redux';

import { ApiPaths } from '../../../config/api.es6.js';
import { Order } from '../lib/api.js';
import { actions as appActions, getState as appState } from './index.js';
import { bookablesBill } from '../lib/computeBookablePrices.js';
import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';
import { orderStates } from '../constants/enumConstants.js';
import ApiErrors from '../constants/ApiErrors.js';
import messages from '../constants/messages.js';
import idFromURLEnd from '../lib/idFromURLEnd.js';
import { toInt, mapObj } from '../lib/helpers.js';
import { captureException } from '../lib/analytics.js';
import analytics from '../../lib/analytics.es6.js';
import { existingOrderTransform, orderStateTransform } from '../data-shapes/order.js';
import requestStateReducer from '../lib/requestReducerHelper.js';
import logger from '../lib/logger.js';
import eltErrorMsg from '../lib/eltErrorMsg.js';

export const types = {
    orderRequest: 'ORDER_REQUEST_FETCH',
    updateOrderFinalId: 'UPDATE_FINAL_ORDER_ID',
    updateOrderMessage: 'ORDER/UPDATE_MESSAGE',
    requestClick: 'REQUEST_INVITE_CLICK',
    requestDone: 'REQUEST_INVITE_CONCLUDED',
    existingOrdersFetch: genFetchTypes('FETCH_EXISTING_ORDERS'),
    userOrdersFetch: genFetchTypes('FETCH_USER_ORDERS'),
    resetUserOrders: genFetchTypes('RESET_USER_ORDERS'),
    placeOrderFetch: genFetchTypes('PLACE_ORDER_FETCH'),
    removeOrderStateFetch: genFetchTypes('REMOVE_ORDER_STATE'),
    replaceOrder: genFetchTypes('REPLACE_ORDER'),
    orderCreate: genFetchTypes('ORDER_CREATE'),
    checkAvailabilityFetch: genFetchTypes('CHECK_AVAILABILITY_FETCH'),
    completeBookingFetch: genFetchTypes('COMPLETE_BOOKING_FETCH'),
    deleteBooking: genFetchTypes('DELETE_BOOKING'),
    cancelOrder: genFetchTypes('CANCEL_ORDER')
};

const existingOrdersReducer = (state = {}, { type, payload, id }) => {
    switch (type) {
    case types.existingOrdersFetch.SUCCESS:
        return { ...state, ...payload };
    case types.removeOrderStateFetch.SUCCESS: {
        const results = state.results && state.results.filter((res) => `${res.id}` !== `${id}`);

        return {
            ...state,
            count: state.count - 1,
            results
        };
    }
    default:
        return state;
    }
};

const userOrdersReducer = (state = {}, { type, payload }) => {
    switch (type) {
    case types.userOrdersFetch.SUCCESS:
        return { ...state, ...payload };
    case types.resetUserOrders:
        return {
            ...state,
            count: 0,
            next: null,
            previous: null,
            results: []
        };
    case types.cancelOrder.SUCCESS:
        const id = idFromURLEnd(payload.url);
        const results = state.results.filter(order => order.id !== String(id));
        return { ...state, results };
    default:
        return state;
    }
};

const orderReducer = (state = {}, { type, id, payload }) => {
    switch (type) {
    case types.requestClick:
        return { ...state, isPending: true };
    case types.requestDone:
        return { ...state, isPending: false };
    case types.existingOrdersFetch.SUCCESS:
        return { ...state, ...payload.results.reduce((acc, r) => ({ ...acc, [r.id]: { ...r } }), {}) };
    case types.checkAvailabilityFetch.SUCCESS:
    case types.orderCreate.SUCCESS:
        return { ...state, [id || payload.id]: { ...state[id], ...payload } };
    case types.placeOrderFetch.SUCCESS:
        return { ...state, [id]: { ...state[id], state: orderStates.PAYMENT_PENDING } };
    case types.completeBookingFetch.SUCCESS:
        return { ...state, [id]: { ...state[id], state: orderStates.PAYMENT_CONFIRMED } };
    case types.updateOrderMessage:
        return { ...state, [id]: { ...state[id], message: payload.message } };
    case types.updateOrderFinalId:
        return { ...state, [id]: { ...state[id], finalId: payload.id, amount: payload.amount, amountInUSD: payload.amountInUSD } };
    case types.removeOrderStateFetch.SUCCESS:
        if (payload && payload.silent) {
            return { ...state, [id]: { ...state[id], state: null } };
        }
        return { ...state, [id]: null };
    case types.replaceOrder.SUCCESS:
        return { ...state, [id]: null, [payload.id]: { ...state[id], message: null, ...payload } };
    case types.deleteBooking.SUCCESS:
        return { ...state, [id]: { ...state[id], finalId: null } };
    default:
        return state;
    }
};

// quantityMap
const orderRequestReducer = (state = {}, { type, id, payload }) => {
    switch (type) {
    case types.orderRequest:
        return { ...state, [id]: payload };
    default:
        return state;
    }
};

/**
 * TODO: Check if order is valid. If not, delete it.
 */


const createOrderTransform = l => ({
    state: orderStates[l.state],
    propertyCode: l.property_details.code,
    propertyId: l.property_details.id,
    id: idFromURLEnd(l.url)
});

const dateFormat = date => date && moment(date).format('YYYY-MM-DD');

const orderParams = ({ property, quantityMap, message, date = {}, couponCode = null, forZeroAmount, gateway }) => ({
    date_from: dateFormat(date.from || property.eventDate),
    date_until: dateFormat(date.until || property.eventDate),
    property: property.url,
    visitor_message: message,
    payment_gateway: gateway || (forZeroAmount ? __PAY_ZERO_GATEWAY__ : __PAY_BACKEND_GATEWAY__),
    // coupon: order.couponCode,
    quantity_map: mapObj(quantityMap, {
        keyFn: k => `${__HOST_URL__}${ApiPaths.bookableUrl(k)}`
    }),
    coupon: couponCode
});

const requestDoneAction = { type: types.requestDone };

const actions = {
    requestDone: () => (dispatch) => dispatch({ type: types.requestDone }),
    fetchExistingLoveRequests: params =>
        simpleJSONFetchDispatcher({
            promiseFn: () => Order.existingLoveRequests(params),
            actionTypes: types.existingOrdersFetch,
            transform: ({ count, next, previous, results }) => ({
                count,
                next,
                previous,
                results: results.map(res => existingOrderTransform(res))
            })

        }),
    placeOrder: () => (dispatch, getState) => {
        const state = getState();
        const property = appState.property.getCurrentProperty(state);
        const order = appState.order.getOrder(state, property.id);
        const coupon = appState.coupon.getCoupon(state);

        const params = orderParams({
            property,
            date: order.date,
            quantityMap: order.quantityMap,
            message: order.message,
            couponCode: coupon.code
        });

        logger.log('placeOrder with params=', params);
        return dispatch(simpleJSONFetchDispatcher({
            id: order.id,
            promiseFn: () => Order.placeOrder(params),
            actionTypes: types.placeOrderFetch,
            returnResponse: true
        }))
            .catch((e) => {
                if (Array.isArray(e) && e[0] && e[0].indexOf(ApiErrors.bookingExists) !== -1) {
                    const existingOrderId = toInt(e[0].split('=')[1]);
                    return Order.getOrder(existingOrderId)
                        .then(res => !res.error && res.payload);
                }
                throw e;
            })
            .then((oldOrder) => {
                logger.log('final id=', oldOrder);
                return dispatch({
                    type: types.updateOrderFinalId,
                    id: order.id,
                    payload: {
                        id: idFromURLEnd(oldOrder.url),
                        amount: oldOrder.amount,
                        amountInUSD: oldOrder.currency_conversion.USD &&
                            oldOrder.currency_conversion.USD.amount_due
                    }
                });
            }).then(() => dispatch(appActions.modals.showPaymentSelector(true)));
    },
    openPayment: () => (dispatch, getState) => {
        const state = getState();
        const userId = appState.session.userId(state);
        const user = appState.user.getUser(state, userId);
        const property = appState.property.getCurrentProperty(state);
        const order = appState.order.getOrder(state, property.id);
        const orderRequest = appState.order.getOrderRequest(state, property.id);
        const gatewayCharge = appState.appConfig.getServiceChargeRate(state);
        const coupon = appState.coupon.getCoupon(state);

        const bill = bookablesBill({
            bookables: property.bookables,
            requests: orderRequest.quantityMap || order.quantityMap,
            gatewayCharge,
            coupon
        });

        const propertyDetails = {
            name: property.caption,
            description: property.caption,
            image: property.images[0].image
        };

        const userDetails = {
            name: user.name,
            email: user.email,
            contact: user.phone
        };

        if (toInt(order.amount) === 0) {
            dispatch(appActions.order.completeBooking('No amount due'));
            return;
        }

        const options = {
            // key: 'rzp_live_s0tl4TqJp0niIm',
            // key: 'rzp_test_lDLPc94665cXrV',
            key: __PAY_RAZOR_PAY_KEY__,
            amount: Math.ceil(toInt(order.amount) * 100),
            currency: 'INR',
            ...propertyDetails,
            notes: {
                elt_order_id: order.finalId
            },
            prefill: userDetails,
            theme: {
                color: '#F37254'
            },
            handler: ({ razorpay_payment_id }) => {
                analytics.fbpTrack('Purchase', {
                    value: order.amount,
                    currency: 'INR',
                    content_name: property && property.code
                });
                analytics.event({
                    eventCategory: 'Booking',
                    eventAction: 'Booking Completed',
                    eventLabel: property && property.caption,
                    eventValue: parseInt(order.amount, 10)
                });
                dispatch(appActions.order.completeBooking(razorpay_payment_id));
            },
            modal: {
                ondismiss: () => dispatch(appActions.order.abortBooking())
            }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
    },
    abortBooking: () => (dispatch, getState) => {
        const state = getState();
        const property = appState.property.getCurrentProperty(state);
        const order = appState.order.getOrder(state, property.id);

        dispatch(simpleJSONFetchDispatcher({
            id: order.id,
            promiseFn: () => Order.deleteBooking(order.finalId),
            actionTypes: types.deleteBooking
        })).then(() => {
            dispatch(requestDoneAction);
            logger.info('Removed booking');
        }).catch(e => captureException(e, order));
    },
    ignoreBooking: () => requestDoneAction,
    completeBooking: (receiptId, gateway) => (dispatch, getState) => {
        const state = getState();
        const property = appState.property.getCurrentProperty(state);
        const order = appState.order.getOrder(state, property.id);

        let params = orderParams({
            property,
            date: order.date,
            quantityMap: order.quantityMap,
            message: order.message,
            forZeroAmount: toInt(order.amount) === 0,
            gateway
        });

        const amountPaid = gateway === 'PAYPAL' ? order.amountInUSD : order.amount;
        params = {
            ...params,
            amount_paid: amountPaid,
            receipt_information: receiptId
        };

        dispatch(simpleJSONFetchDispatcher({
            id: order.id,
            promiseFn: () => Order.completeBooking(order.finalId, params),
            actionTypes: types.completeBookingFetch
        })).then(() => {
            dispatch(requestDoneAction);
            dispatch(appActions.modals.showBookingSuccess(order.id));
        }).catch((e) => {
            dispatch(appActions.modals.showMessageModal(
                'Error',
                `There was an error in processing order ${order.id}. Please contact support@explorelifetraveling.com.\t${eltErrorMsg(e, '')}`
            ));
            dispatch(requestDoneAction);
            captureException(e, params);
        });
    },
    createOrder: (message, { orderChange } = {}) => (dispatch, getState) => {
        const state = getState();

        const property = appState.property.getCurrentProperty(state);

        const userId = appState.session.userId(state);
        const currentOrderState = appState.order.getOrder(state, property.id);

        if (currentOrderState && currentOrderState.state === orderStates.ACCEPTED) {
            logger.log('Order is already accepted');
            return dispatch(appActions.order.placeOrder());
        }

        if (currentOrderState && currentOrderState.state === orderStates.NOTIFICATION_SENT) {
            dispatch(appActions.modals.showMessageModal(
                messages.NOTIFICATION_SENT_MESSAGE_TITLE,
                messages.NOTIFICATION_SENT_MESSAGE
            ));
            dispatch(requestDoneAction);
            return Promise.resolve();
        }


        if (property.membersOnly && !appState.user.isMemberOf(state, userId, property.openToGroups)) {
            // Show modal
            dispatch(requestDoneAction);
            logger.log('This is only for members');
            return Promise.resolve();
        }

        if (!property.instabook && !message && (!currentOrderState || !currentOrderState.message)) {
            dispatch(appActions.modals.showOrderAskUserMessage());
            return Promise.resolve();
        }

        let orderState;
        if (!currentOrderState || !currentOrderState.state) {
            logger.log('creating currentOrderState');
            orderState = dispatch(simpleJSONFetchDispatcher({
                promiseFn: () => Order.create(property.id, {}),
                actionTypes: types.orderCreate,
                transform: createOrderTransform,
                returnResponse: true
            }));
        } else {
            logger.log('currentOrderState exists', currentOrderState);
            orderState = Promise.resolve(currentOrderState);
        }

        return orderState
            .then(() => {
                analytics.fbpTrack('AddToCart', {
                    content_name: property && property.code
                });
                analytics.event({
                    eventCategory: 'Booking',
                    eventAction: 'Check Availability',
                    eventLabel: property.caption
                });

                return dispatch(appActions.order.checkAvailability(message));
            })
            .catch((err) => {
                if (Array.isArray(err) && err[0] === ApiErrors.orderStateExists) {
                    if (process.env.NODE_ENV !== 'production') {
                        logger.warn('Order state (love data) already exists');
                    }
                    // fetch the current order state.
                    const order = appState.order.getOrder(state, property && property.id);
                    return dispatch(appActions.order.removeOrderState(order.id))
                        .then(() => dispatch(appActions.order.checkAvailability(message)));
                    // return Promise.resolve();
                }

                dispatch(requestDoneAction);
                return Promise.reject(err);
            })
            .then(() => {
                const state = getState();
                const property = appState.property.getCurrentProperty(state);
                const order = appState.order.getOrder(state, property.id);
                if (order.state === orderStates.NOTIFICATION_SENT) {
                    dispatch(appActions.modals.showMessageModal(
                        messages.NOTIFICATION_SENT_MESSAGE_TITLE,
                        messages.NOTIFICATION_SENT_MESSAGE
                    ));
                    dispatch(requestDoneAction);
                    return Promise.resolve();
                }
                // TODO: handle cases where event is instabook and all slots are
                // booked, it results in confusing a error message right now
                const unavailMsg = property.isExperience ? messages.EVENT_UNAVAILABLE_MESSAGE :
                    messages.ROOMS_UNAVAILABLE_MESSAGE;
                if (order.state !== orderStates.ACCEPTED) {
                    dispatch(appActions.modals.showMessageModal(
                        messages.BOOKING_UNAVAILABLE_TITLE,
                        unavailMsg
                    ));
                    dispatch(requestDoneAction);
                    return Promise.resolve();
                }
                return dispatch(appActions.order.placeOrder());
            });
    },
    requestClickEvent: request => (dispatch, getState) => {
        const state = getState();

        const property = appState.property.getCurrentProperty(state);

        const quantityMap = property.bookables.reduce((acc, b) => {
            const booking = request[`bookable-${b.id}`];
            const requested = booking ? toInt(booking) : 0;
            if (!requested > 0) {
                return acc;
            }

            return {
                ...acc,
                [b.id]: {
                    isChosen: requested > 0,
                    requested
                }
            };
        }, {});

        return dispatch(appActions.order.requestClick({
            quantityMap,
            date: {
                from: moment(property.eventDate),
                until: moment(property.eventDate)
            }
        }));
    },
    requestClick: request => (dispatch, getState) => {
        dispatch({ type: types.requestClick });

        const state = getState();

        const property = appState.property.getCurrentProperty(state);

        const { date } = request;
        const quantityMap = mapObj(request.quantityMap, {
            valFn: v => ({
                requested: toInt(v.isChosen ? (v.requested || 1) : 0),
                extra_guests: toInt(v.extraGuests || 0)
            })
        });

        // validate at least one booking
        if (!Object.values(quantityMap).some(b => b.requested > 0)) {
            dispatch(appActions.modals.showMessageModal(
                messages.SELECT_MIN_ONE_BOOKABLE_TITLE,
                messages.SELECT_MIN_ONE_BOOKABLE
            ));
            dispatch(requestDoneAction);
            return Promise.resolve();
        }

        dispatch({
            type: types.orderRequest,
            id: property.id,
            payload: { date, quantityMap }
        });

        if (!appState.session.hasSession(state)) {
            dispatch(appActions.login.toggleLoginModalVisibility(true));
            dispatch(requestDoneAction);
            return Promise.resolve();
        }

        const userId = appState.session.userId(state);
        const user = appState.user.getUser(state, userId);
        const emailPresent = user.email && user.email.indexOf('@example.com') === -1;
        const descPresent = !!user.ownerPropertyIntro;
        const canBookProperty = user.phone && emailPresent && descPresent;
        const canBookEvent = canBookProperty &&
            user.profilePic.indexOf('default-user') === -1 &&
            user.ownerPropertyIntro;

        if (property.isExperience && !canBookEvent) {
            dispatch(appActions.modals.shouldShowMissingDetailsModal(true));
            dispatch(requestDoneAction);
            return Promise.resolve();
        }

        if (!property.isExperience && !canBookProperty) {
            dispatch(appActions.modals.shouldShowMissingDetailsModal(true));
            dispatch(requestDoneAction);
            return Promise.resolve();
        }

        const currentOrder = appState.order.getOrder(state, property.id);

        if (currentOrder) {
            // TODO: add checks for changes in order quantity
            const sameDates = currentOrder.date.from && currentOrder.date.from.isSame(request.date.from)
                  && currentOrder.date.until && currentOrder.date.until.isSame(request.date.until);

            const cQnt = request.quantityMap;
            const oQnt = currentOrder.quantityMap;
            const quantityMapChanged = Object.keys(cQnt).reduce((hasChanged, bid) => {
                if (hasChanged) {
                    return true;
                }

                const currentRequested = cQnt[bid] && toInt(cQnt[bid].requested);
                const lastRequested = oQnt[bid] && toInt(oQnt[bid].requested);

                return (currentRequested !== lastRequested) || (cQnt[bid].extraGuests || 0) !== (oQnt[bid].extraGuests || 0);
            }, false);

            const noOfRoomsDifferent = Object.values(cQnt).length !== Object.values(oQnt).length;

            if (!sameDates || quantityMapChanged || noOfRoomsDifferent) {
                logger.log('deleting currentOrder=', currentOrder);
                return dispatch(appActions.modals.showOrderAskUserMessage({ showOrderChangeMessage: true }));
            }
            if (currentOrder.state === 'ORDER_ACCEPTED' || currentOrder.state === 'ORDER_PAYMENT_PENDING') {
                return dispatch(appActions.order.placeOrder());
            }
            dispatch(requestDoneAction);
            return Promise.resolve();
        }

        return dispatch(appActions.order.createOrder());
    },
    checkAvailability: message => (dispatch, getState) => {
        const state = getState();

        const property = appState.property.getCurrentProperty(state);
        if (!property) {
            if (process.env.NODE_ENV !== 'production') {
                logger.warn('No current property?', property);
            }
            // Show error?

            return Promise.resolve();
        }

        const currentOrderState = appState.order.getOrder(state, property.id);
        const orderRequest = appState.order.getOrderRequest(state, property.id);

        const params = orderParams({
            property,
            date: orderRequest.date,
            quantityMap: orderRequest.quantityMap,
            message
        });

        logger.log('checkAvailability with params=', params);
        return dispatch(simpleJSONFetchDispatcher({
            id: currentOrderState.id,
            promiseFn: () => Order.checkAvailability(currentOrderState.id, params),
            actionTypes: types.checkAvailabilityFetch,
            transform: l => l && existingOrderTransform(l)
        }));
    },
    resetPropertyOrder: id =>
        simpleJSONFetchDispatcher({
            promiseFn: () => Order.checkOrderState(id),
            actionTypes: types.orderStateFetch,
            transform: d => existingOrderTransform(d && d.count && d.results[0])
        }),
    replaceOrder: (id, propertyId) =>
        simpleJSONFetchDispatcher({
            id,
            promiseFn: () => Order.create(propertyId, {}),
            actionTypes: types.replaceOrder,
            transform: createOrderTransform,
            returnResponse: true
        }),
    removeOrderState: (id, opts) =>
        simpleJSONFetchDispatcher({
            id,
            promiseFn: () => Order.resetOrder(id),
            actionTypes: types.removeOrderStateFetch,
            transform: () => opts
        }),
    fetchUserOrders: params => simpleJSONFetchDispatcher({
        promiseFn: () => Order.getOrders(Object.assign({
            as_owner: 'true'
        }, params)),
        actionTypes: types.userOrdersFetch,
        transform: ({ count, next, previous, results }) => ({
            count,
            next,
            previous,
            results: results.map(result => orderStateTransform(result))
        })

    }),
    fetchUserOrdersByUrl: url => simpleJSONFetchDispatcher({
        promiseFn: () => Order.byUrl(url),
        actionTypes: types.userOrdersFetch,
        transform: ({ count, next, previous, results }) => ({
            count,
            next,
            previous,
            results: results.map(result => orderStateTransform(result))
        })
    }),
    resetUserOrders: () => ({
        type: types.resetUserOrders
    }),
    cancelOrder: id => simpleJSONFetchDispatcher({
        promiseFn: () => Order.cancelOrder(id),
        actionTypes: types.cancelOrder,
        returnResponse: true
    }),
    modifyRequest: message => (dispatch, getState) => {
        const state = getState();
        const property = appState.property.getCurrentProperty(state);
        const currentOrder = appState.order.getOrder(state, property.id);
        return dispatch(appActions.order.removeOrderState(currentOrder.id, { silent: true }))
            .then(() => dispatch(appActions.order.replaceOrder(currentOrder.id, property.id)))
            .then(() => dispatch(appActions.order.createOrder(message)));
    }
};

const getFns = {
    isInLoginFlow: state => state.flow.inFlow,
    getOrderById: (state, orderId) =>
        state.order[orderId],
    getOrder: (state, propertyId) => state.order &&
        Object.values(state.order).find(o => `${o && o.propertyId}` === `${propertyId}`),
    getExistingValidOrder: (state, propertyId) => {
        const order = Object.values(state.order)
              .filter(o => o && o.date && o.date.from && moment(o.date.from).isSameOrAfter(moment(), 'day'))
              .find(o => `${o && o.propertyId}` === `${propertyId}`);
        return order && order;
    },
    getExistingLoveRequests: state => state.existingOrders,
    getOrderRequest: (state, propertyId) => state.orderRequest[propertyId],
    isInProgress: state => (state.order && state.order.isPending) || false,
    removeOrderStateLoading: state => state.removeOrderStateLoad.isFetching,
    getUserOrders: state => state.userOrders,
    isUserOrdersLoading: state => state.userOrdersState.isFetching
};

export default {
    actions,
    reducer: combineReducers({
        order: orderReducer,
        orderRequest: orderRequestReducer,
        existingOrders: existingOrdersReducer,
        removeOrderStateLoad: requestStateReducer(types.removeOrderStateFetch),
        userOrders: userOrdersReducer,
        userOrdersState: requestStateReducer(types.userOrdersFetch)
    }),
    get: getFns
};
