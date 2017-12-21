import { PropTypes } from 'react';
import moment from 'moment';
import { userTransform } from './user.js';
import { eventPropertyTransform } from './property.js';
import idFromURLEnd from '../lib/idFromURLEnd.js';

import { formatDate } from '../lib/helpers.js';

export const hostOrderProptype = PropTypes.shape({
    owner: PropTypes.string,
    bookings: PropTypes.arrayOf(PropTypes.any),
    amount: PropTypes.string,
    downpayment: PropTypes.string,
    exploreFee: PropTypes.string,
    fee: PropTypes.string,
    cost: PropTypes.string,
    dateFrom: PropTypes.obj,
    dateUntil: PropTypes.obj,
    state: PropTypes.string,
    url: PropTypes.string
});

const hostOrderTransform = ({
    owner,
    bookings,
    quantity_map,
    amount,
    downpayment,
    explore_fee,
    fee,
    cost,
    date_from,
    date_until,
    state,
    currency_conversion,
    url
}) => {
    let quantityMap = Object.keys(quantity_map).map((key) => {
        const { id, requested, amount } = quantity_map[key]; // eslint-disable-line no-shadow
        const val = amount && Object.values(amount)[0];
        return {
            id,
            requested,
            val
        };
    });
    const booking = bookings.find(p =>
        p.property.bookable_items.some(b => idFromURLEnd(b.url) === quantityMap[0].id));
    const property = booking ? booking.property : {};

    quantityMap = quantityMap.map((i) => {
        const caption = property.bookable_items.find(j => idFromURLEnd(j.url) === i.id).caption;
        return { ...i, caption };
    });

    const guest = bookings[0] && userTransform(bookings[0].owner_info);
    return {
        guest,
        bookings,
        amount,
        downpayment,
        exploreFee: explore_fee,
        fee,
        cost,
        amountInUSD: currency_conversion.USD.amount_due,
        downpaymentInUSD: currency_conversion.USD.downpayment_amount,
        owner,
        quantityMap,
        property: eventPropertyTransform(property),
        checkIn: formatDate(date_from),
        checkOut: formatDate(date_until),
        dateFrom: moment(date_from, 'YYYY-MM-DD').toJSON(),
        dateUntil: moment(date_until, 'YYYY-MM-DD').toJSON(),
        state,
        url,
        id: idFromURLEnd(url)
    };
};

export default hostOrderTransform;
