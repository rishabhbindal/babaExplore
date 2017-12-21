/* global angular */

import moment from 'moment';

const getBookingDays = (packageType, fromDate, untilDate) => {
    if (packageType === 1) {
        if (fromDate && untilDate) {
            const from = moment(fromDate, 'DD/MM/YYYY');
            const until = moment(untilDate, 'DD/MM/YYYY');

            return moment.duration(until.diff(from)).days();
        }
    }

    if (fromDate) {
        return 1;
    }
};

const getRequested = (propertyBookables, bookable) => {
    let requested = 0;
    angular.forEach(propertyBookables, requestedListing => {
        if (requestedListing.url === bookable.url) {
            requested = requestedListing.requested;
        }
    });

    return requested;
};

const getExtraPersonCharge = (propertyBookables, bookable, requested, bookingDays) => {
    let charge = 0;

    angular.forEach(propertyBookables, requestedListing => {
        if (requestedListing.url === bookable.url && requested !== 0 &&
            requestedListing.extra_guests) {
            charge += (requestedListing.extra_guests *
                requestedListing.extra_person_charge * bookingDays);
        }
    });

    return charge;
};

const bookableDownPayment = (bookable, requested, bookingDays, extraPersonCharge) => {
    switch (bookable.downpayment_value_type) {
        case 'DISABLED':
            return bookingDays * bookable.daily_price * requested + extraPersonCharge;

        case 'AMOUNT':
            return bookingDays * bookable.downpayment_value * requested;

        case 'PERCENT':
            return bookingDays * bookable.daily_price *
                bookable.downpayment_value / 100 * requested;
    }
};


export default (packageType, requestedData, bookableItems) => {
    const bookingDays = getBookingDays(packageType, requestedData.date_from, requestedData.date_until);
    let total = 0;

    bookableItems.forEach(bookable => {
        const requested = getRequested(requestedData.bookables, bookable);
        const extraPersonCharge = getExtraPersonCharge(requestedData.bookables, bookable, requested, bookingDays);

        total += bookableDownPayment(bookable, requested, bookingDays, extraPersonCharge);
    });

    return total;
};
