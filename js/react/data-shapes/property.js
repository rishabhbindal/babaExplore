import { PropTypes } from 'react';
import moment from 'moment';

import { chargeType, bookableTypes } from '../constants/enumConstants.js';
import { imageSetTransform, imageSetPropType, escapeBrackets } from './image.js';
import { videoTransform, videoPropType } from './video.js';
import { featureIconType, featureIconTransform } from './featureIcon.js';
import idFromURLEnd from '../lib/idFromURLEnd.js';
import { calculateCharge } from '../lib/computeBookablePrices.js';

const { bool, string, number, shape, arrayOf } = PropTypes;

export const searchPropertyType = shape({
    url: PropTypes.string,
    caption: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    code: PropTypes.string,
    availableTo: PropTypes.string,
    location: PropTypes.string,
    images: arrayOf(imageSetPropType),
    owner: PropTypes.string,
    icons: PropTypes.any,
    listingType: PropTypes.string,
    dailyPrice: PropTypes.number,
    lat: PropTypes.string,
    long: PropTypes.string
});

export const eventPropertyType = shape({
    bookables: arrayOf(PropTypes.object),
    caption: string,
    city: string,
    character: string,
    code: string,
    descriptionMap: arrayOf(shape({
        title: string,
        content: string
    })),
    eventDate: PropTypes.string,
    icons: arrayOf(shape(featureIconType)),
    id: number,
    images: arrayOf(imageSetPropType),
    mastImage: imageSetPropType,
    membersOnly: bool,
    openToGroups: arrayOf(string),
    position: shape({ latitude: number, longitude: number }),
    locality: string,
    url: string,
    dailyPrice: PropTypes.number,
    state: PropTypes.string,
    linkedListingCode: PropTypes.string,
    promotedUsers: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        quote: PropTypes.string,
        profilePic: PropTypes.string
    })),
    cancellationPolicy: PropTypes.string,
    videos: PropTypes.arrayOf(videoPropType),
    type: PropTypes.bool,
    relatedEvent: PropTypes.arrayOf(PropTypes.string),
    relatedLounge: PropTypes.arrayOf(PropTypes.string),
    percentFee: PropTypes.shape({
        enabled: PropTypes.bool,
        val: PropTypes.number
    })
});

export const searchFilterPropTypes = PropTypes.shape({
    category: PropTypes.string,
    forceCategory: PropTypes.string,
    city: PropTypes.string,
    country: PropTypes.string,
    locality: PropTypes.string,
    showMap: PropTypes.bool,
    sortBy: PropTypes.string,
    checkIn: PropTypes.string,
    checkOut: PropTypes.string
});

export const searchFilterDefaultProps = {
    country: 'India',
    sortBy: '-dailyPrice'
};

const toInt = i => parseInt(i, 10);

const videoCaptions = [
    'StartupTour Full Video',
    'Memories from the first edition of startup tour'
];

const bookableTransform = ({
    amenities = [],
    caption,
    currency,
    description_map,
    daily_price,
    downpayment_value,
    downpayment_value_type,
    explore_fee_type,
    explore_fee,
    images,
    minimum_stay,
    per_person_pricing,
    extra_person_charge,
    guest_charge,
    max_guests,
    no_of_instances,
    no_of_guests,
    type,
    url
}) => {
    if (process.env.NODE_ENV !== 'production') {
        if (!chargeType[explore_fee_type]) {
            console.warn('Unknow explore_fee_type=', explore_fee_type);
        }

        if (!chargeType[downpayment_value_type]) {
            console.warn('Unknown downpayment_value_type=', downpayment_value_type);
        }

        if (downpayment_value_type !== 'DISABLED') { // eslint-disable-line camelcase
            console.warn('Downpayment not implemented for events, yet.');
        }
    }

    let bookableType = 'PACKAGE';
    if (type === 'PACKAGE' && videoCaptions.includes(caption)) {
        bookableType = bookableTypes.VIDEO;
    } else if (type === 'PACKAGE') {
        bookableType = bookableTypes.PACKAGE;
    } else if (type === 'ROOM') {
        bookableType = bookableTypes.ROOM;
    } else if (process.env.NODE_ENV !== 'production') {
        console.warn('Unknown bookable type', type);
    }

    const descriptionMap = Object.entries(description_map || {})
          .map((([, v]) => ({
              title: Object.keys(v)[0],
              content: Object.values(v)[0]
          })));

    const inclusivePrice = toInt(
        daily_price + calculateCharge({
            charge: {
                type: chargeType[explore_fee_type],
                amount: toInt(explore_fee)
            },
            price: daily_price,
            itemCount: 1
        }));

    return {
        amenities,
        bookableInstanceLabel: caption,
        bookableType,
        caption,
        descriptionMap,
        pricing: {
            currency,
            ticketPrice: inclusivePrice,
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
        },
        stay: {
            instanceCount: toInt(no_of_instances),
            minimumStay: toInt(minimum_stay),
            perInstanceGuests: toInt(no_of_guests),
            allowsExtraGuests: toInt(max_guests) > toInt(no_of_guests),
            maxExtraGuests: toInt(max_guests) - toInt(no_of_guests)
        },
        downPayment: {
            type: chargeType[downpayment_value_type],
            amount: toInt(downpayment_value)
        },
        exploreFee: {
            type: chargeType[explore_fee_type],
            amount: toInt(explore_fee)
        },
        images: Object.values(images)
            .filter(v => v.ordering >= 0)
            .sort((a, b) => a.ordering - b.ordering)
            .map(imageSetTransform),
        instanceCount: toInt(no_of_instances),
        ticketPrice: inclusivePrice,
        actualTicketPrice: daily_price,
        id: idFromURLEnd(url),
        url
    };
};

const promotedUsersTransform = users => users.map(user => ({
    name: user.full_name,
    quote: user.about,
    profilePic: user.thumbnail || user.picture || user.social_picture || user.social_profile_picture
}));

export const eventPropertyTransform = ({
    amenities,
    bookable_items = {},        // eslint-disable-line camelcase
    caption,
    category,
    character,
    city,
    code,
    community_manager,
    config = {},
    description_map,
    house_rules,
    icons,
    id,
    images,
    instabook,
    latitude,
    locality,
    longitude,
    owner,
    url,
    daily_price,
    state,
    linked_listing_code, // eslint-disable-line camelcase
    promoted_users, // eslint-disable-line camelcase
    cancellation_policy, // eslint-disable-line camelcase
    videos,
    panoramic_images,
    type
}) => {
    if (!caption && !id) {
        throw new Error('Event fetch failed');
    }

    const imgs = images.map(img => ({ ...img, ...{ ordering: toInt(img.ordering) } }));
    const vids = videos.map(vid => ({ ...videoTransform(vid) }));

    let mastImage = Object.values(imgs)
        .find(i => i.ordering === -1);

    if (mastImage) {
        mastImage = escapeBrackets(imageSetTransform(mastImage));
    }
    const bookables = Object.values(bookable_items)
          .filter(b => b && b.status === 'ENABLED')
          .map(bookableTransform);

    const imageSetTitle = config.eventImageSetTitle;


    let descriptionMap = Object.entries(description_map || {})
        .map((([, v]) => ({
            title: Object.keys(v)[0],
            content: Object.values(v)[0]
        })));

    if (house_rules) {
        descriptionMap = descriptionMap.concat([{
            title: 'House rules',
            content: house_rules
        }]);
    }

    const isExperience = type.toLowerCase() === 'experience';

    const bookablesWithPercentFee = bookables.filter(b => b.exploreFee.type === '_PERCENT');
    const percentFee = {
        enabled: bookablesWithPercentFee.length,
        val: bookablesWithPercentFee[0] && bookablesWithPercentFee[0].exploreFee.amount
    };

    return {
        amenities,
        bookables,
        caption,
        city,
        meta: {
            description: config.description,
            keywords: config.keywords,
            title: config.title
        },
        character,
        owner,
        code,
        communityManager: community_manager,
        mastImage,
        membersOnly: config.member_only_booking === 'true',
        openToGroups: (category && category.split(',')) || [],
        // eslint-disable-next-line camelcase
        descriptionMap,
        eventDate: moment(config.default_date, 'YYYY-MM-DD').toJSON(),
        icons: icons.map(featureIconTransform),
        id,
        imageSetTitle,
        /**
         * Where does the custom image logic fit?
         *
         * Handle the case where one of the images might not have a
         * particular resolution. In which case rest of the images
         * should also reduce that resolution? How does that make
         * sense?
         */
        images: Object.values(images)
            .filter(v => v.ordering >= 0)
            .sort((a, b) => a.ordering - b.ordering)
            .map(imageSetTransform),
        instabook,
        position: { latitude, longitude },
        locality,
        url,
        dailyPrice: daily_price,
        state,
        linkedListingCode: linked_listing_code,
        promotedUsers: promotedUsersTransform(promoted_users),
        cancellationPolicy: cancellation_policy,
        videos: vids,
        panoImages: panoramic_images,
        isExperience,
        percentFee,
        relatedEvent: config.relatedEvent ? config.relatedEvent.split(',') : [],
        relatedLounge: config.relatedLounge ? config.relatedLounge.split(',') : []
    };
};

export const searchPropertyTransform = ({
    url,
    caption,
    state,
    city,
    code,
    listing_type,
    description_map,
    amenities,
    daily_price,
    images,
    owner,
    icons,
    latitude,
    longitude,
    bookable_items = {},        // eslint-disable-line camelcase
}) => {
    const location = [city, state].filter(Boolean).join(', ');
    const availableTo = description_map && description_map['Who is it for'];
    amenities = amenities.slice(0, 3);
    images = images.slice(0, 3);

    const bookables = Object.values(bookable_items)
          .filter(b => b && b.status === 'ENABLED')
          .map(bookableTransform);

    return {
        bookables,
        url,
        caption,
        city,
        state,
        code,
        availableTo,
        location,
        amenities,
        images: Object.values(images)
            .filter(v => v.ordering >= 0)
            .sort((a, b) => a.ordering - b.ordering)
            .map(imageSetTransform),
        owner,
        icons,
        listingType: listing_type,
        dailyPrice: daily_price,
        lat: latitude,
        long: longitude
    };
};

export const mapViewPropTransform = ({
    url,
    caption,
    code,
    latitude,
    longitude,
    image,
    daily_price
}) => ({
    url,
    code,
    caption,
    lat: latitude,
    long: longitude,
    image: imageSetTransform(image || {}),
    dailyPrice: daily_price
});
