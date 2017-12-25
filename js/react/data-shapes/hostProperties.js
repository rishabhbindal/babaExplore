import { PropTypes } from 'react';
import moment from 'moment';
import { userTransform } from './user.js';
import { searchPropertyType } from './property.js';
import idFromURLEnd from '../lib/idFromURLEnd.js';
import { formatDate } from '../lib/helpers.js';
import { chargeType } from '../constants/enumConstants.js';

const { object, string, shape } = PropTypes;

const toInt = i => parseInt(i, 10);

export const hostBookingsTransform = ({
    bookable_item,
    date_from,
    date_until,
    notes,
    order,
    owner,
    owner_info,
    property,
    url
}) => ({
    notes,
    order,
    property,
    url,
    ownerUrl: owner,
    orderUrl: order,
    bookableItemUrl: bookable_item,
    guest: userTransform(owner_info),
    checkIn: moment(date_from, 'YYYY-MM-DD'),
    checkOut: moment(date_until, 'YYYY-MM-DD')
});

export const hostBookingsPropType = shape({
    checkIn: object,
    checkOut: object,
    notes: string,
    order: string,
    property: searchPropertyType,
    ownerUrl: string,
    orderUrl: string,
    bookableItemUrl: string,
    guest: object,
    url: string
});

export const hostBookableTransform = ({
    caption,
    cleaning_fee,
    currency,
    daily_price,
    description_map,
    downpayment_value,
    downpayment_value_type,
    explore_fee,
    explore_fee_type,
    max_guests,
    minimum_stay,
    monthly_price,
    no_of_bathrooms,
    no_of_bedrooms,
    no_of_beds,
    no_of_guests,
    no_of_instances,
    per_person_pricing,
    guest_charge,
    property,
    status,
    type,
    url
}) => ({
    url,
    type,
    status,
    property,
    caption,
    currency,
    id: idFromURLEnd(url),
    noOfBeds: no_of_beds,
    maxGuests: max_guests,
    dailyPrice: daily_price,
    exploreFee: explore_fee,
    exploreFeeValueType: explore_fee_type,
    noOfGuests: no_of_guests,
    cleaningFee: cleaning_fee,
    minimumStay: minimum_stay,
    monthlyPrice: monthly_price,
    noOfBedrooms: no_of_bedrooms,
    noOfBathrooms: no_of_bathrooms,
    noOfInstances: no_of_instances,
    descriptionMap: description_map,
    downpaymentValue: downpayment_value,
    perPersonPricing: per_person_pricing,
    downpaymentValueType: downpayment_value_type,
    pricing: { // hack to use computeBookablePrices for host orders
        currency,
        ticketPrice: toInt(daily_price),
        isPerPersonPricing: !!per_person_pricing, // This is only true for events.
        guestCharge: toInt(guest_charge),         // Most likely, not used for events
        downPayment: {
            type: chargeType[downpayment_value_type],
            amount: toInt(downpayment_value)
        },
        exploreFee: {
            type: chargeType[explore_fee_type],
            amount: toInt(explore_fee)
        }
    }

});

export const hostPropertiesTransform = ({
    caption,
    accommodation_type,
    amenities,
    bookable_items,
    city,
    community_manager,
    daily_price,
    id,
    instabook,
    instances,
    listing_type,
    no_of_guests,
    number_of_reviews,
    owner,
    state,
    status,
    type,
    url,
    code,
    disable_fee_for_host_order
}) => {
    const location = [city, state].filter(Boolean).join(', ');

    return {
        url,
        id,
        caption,
        amenities,
        location,
        instabook,
        instances,
        city,
        status,
        type,
        accommodationType: accommodation_type,
        bookableItems: bookable_items.map(bookable => hostBookableTransform(bookable)),
        listingType: listing_type,
        noOfGuests: no_of_guests,
        noOfReviews: number_of_reviews,
        dailyPrice: daily_price,
        communityManagerUrl: community_manager,
        ownerUrl: owner,
        code,
        disableFeeForHostOrders: disable_fee_for_host_order
    };
};

export const hostAwaitingResponsesTransform = ({
    date_from,
    date_until,
    host_message,
    owner,
    property,
    quantity_map,
    state,
    url,
    visitor_message
}) => {
    const bookedItems = Object.keys(quantity_map).map(key => (
        hostBookableTransform(property.bookable_items.find(data => (idFromURLEnd(data.url) === idFromURLEnd(key))))
    ));

    const totalRequestedQuantities = Object.values(quantity_map).reduce(
        ((sum, data) => (sum + data.requested)),
        0
    );

    return {
        url,
        state,
        totalRequestedQuantities,
        bookedItems,
        quantityMap: quantity_map,
        owner: userTransform(owner),
        property: hostPropertiesTransform(property),
        checkIn: formatDate(date_from),
        checkOut: formatDate(date_until),
        hostMessage: host_message,
        visitorMessage: visitor_message
    };
};
