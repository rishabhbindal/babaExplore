import moment from 'moment';
import { PropTypes } from 'react';
import { toInt, toObj, formatDate } from '../lib/helpers.js';
import { orderStates } from '../constants/enumConstants.js';
import { eventPropertyTransform } from './property.js';
import { userTransform } from './user.js';
import idFromURLEnd from '../lib/idFromURLEnd.js';
import capitalize from '../../lib/capitalize.es6.js';

const { shape, arrayOf, object, number, string, oneOf } = PropTypes;

export const orderPropType = shape({
    bill: shape({
        amount: number,
        fee: number
    }),
    bookableOrders: arrayOf(shape({
        bookable: string,
        requested: number,
        extraGuests: number
    })),
    date: object,
    downPayment: shape({
        amount: number,
        fee: number,
        total: number
    }),
    orderState: oneOf(Object.entries(orderStates))
});


export const orderStateTransform = ({
    amount,
    amount_paid,
    date_from,
    date_until,
    downpayment,
    downpayment_cost,
    downpayment_fee,
    fee,
    explore_fee,
    host_message,
    quantity_map = {},
    state,
    bookings,
    owner,
    url
}) => {
    const bookableOrders = Object.entries(quantity_map)
          .map(([burl, order]) => ({
              url: burl,
              bookable: idFromURLEnd(burl),
              requested: toInt(order.requested),
              extraGuests: toInt(order.extra_guests)
          }));

    const orderState = orderStates[state];

    const property = bookings.length ? bookings[0].property : {};
    const ownerInfo = bookings.length ? bookings[0].owner_info : {};

    if (!orderState && process.env.NODE_ENV !== 'production') {
        console.warn('Order state not recognised: ', orderState);
    }

    const dateFrom = moment(date_from, 'YYYY-MM-DD');
    const dateUntil = moment(date_until, 'YYYY-MM-DD');

    let bookingType = 'Upcoming';
    if (dateFrom <= new Date() && dateUntil >= new Date()) {
        bookingType = 'Ongoing';
    } else if (dateUntil < new Date()) {
        bookingType = 'History';
    }
    const requestedGuests = Object.values(quantity_map).reduce((acc, obj) => acc + obj.requested, 0);
    const requestedRooms = bookings.length;

    return {
        url,
        requestedGuests,
        requestedRooms,
        bookingType,
        bookings,
        bill: {
            amountPaid: toInt(amount_paid),
            amountRemaining: toInt(amount - amount_paid),
            amount: toInt(amount),
            fee: toInt(fee),
            exploreFee: toInt(explore_fee)
        },
        bookableOrders,
        quantityMap: quantity_map,
        date: {
            from: dateFrom,
            until: dateUntil
        },
        downPayment: {
            amount: toInt(downpayment_cost),
            fee: toInt(downpayment_fee),
            total: toInt(downpayment)
        }, // host order?
        hostMessage: host_message, // only if host rejected
        id: idFromURLEnd(url),
        orderState,
        property: eventPropertyTransform(property),
        ownerInfo: userTransform(ownerInfo),
        ownerUrl: owner
    };
};

// const paymentParams = {
//     date_from: 'requested.date_from',
//     date_until: 'requested.date_until',
//     property: 'property.url',
//     visitor_message: 'message',
//     payment_gateway: 'RAZOR_PAY',
//     coupon: 'couponCode',
//     quantity_map: [{
//         requested: '',
//         extra_guests: ''
//     }]
// };

export const existingOrderTransform = ({
    date_from,
    date_until,
    host_message,
    owner,
    property_details,
    quantity_map = {},
    url,
    state,
    visitor_message,
    cost,
    downpayment_cost,
    has_custom_price
}) => {
    const formattedState = capitalize(state.replace('_', ' ').toLowerCase());
    const propertyCode = property_details.code;
    const propertyId = property_details.id;
    const quantityMap = toObj(Object.entries(quantity_map).map(([k, v]) => [idFromURLEnd(k), {
        ...v,
        requested: toInt(v.requested),
        extraGuests: toInt(v.extra_guests)
    }]));
    const id = idFromURLEnd(url);
    const coverImage = (property_details && property_details.images.length && property_details.images[0]);
    const eventDate = property_details.config && property_details.config.default_date;

    return {
        id,
        url,
        propertyId,
        coverImage,
        quantityMap,
        propertyCode,
        formattedState,
        ownerId: owner,
        checkIn: formatDate(date_from),
        checkOut: formatDate(date_until),
        date: {
            from: formatDate(date_from || eventDate),
            until: formatDate(date_until || eventDate)
        },
        message: visitor_message,
        hostMessage: host_message,
        property: eventPropertyTransform(property_details),
        state: orderStates[state],
        hasCustomPrice: has_custom_price,
        cost,
        downpaymentCost: downpayment_cost
    };
};
