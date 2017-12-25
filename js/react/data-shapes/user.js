import { PropTypes } from 'react';
import moment from 'moment';
import { imageSetTransform, imageSetPropType } from './image.js';

const { shape, string, arrayOf, bool } = PropTypes;

export const userTransform = ({
    bookings,
    about,
    additional_pictures = [],
    email,
    date_of_birth,
    groups_joined,
    groups_joined_info,
    first_name,
    last_name,
    full_name,
    picture,
    social_picture,
    social_profile_picture,
    // thumbnail,
    url,
    owns_properties,
    owns_experiences,
    manages_properties,
    manages_experiences,
    details = {}
}) => {
    if (additional_pictures.length && process.env.NODE_ENV !== 'production') {
        console.warn(`additional_pictures field is depricated.
Was earlier used to show mast for properties.
Use -1 index from property images instead.`);
    }

    const descriptionMap = Object.values(details.description_map || {}) || [];

    const hostOrderObj = descriptionMap.find((data) => {
        if (Object.keys(data).includes('host_order')) {
            return true;
        }
        return false;
    });

    const hostOrder = hostOrderObj && hostOrderObj.host_order;

    const canCreateHostOrder = (hostOrder && hostOrder.toLowerCase() === 'enabled');

    let dob = {};
    if (date_of_birth) {
        [dob.year, dob.month, dob.day] = date_of_birth.split('-');
    }

    const profilePic = picture || social_picture || (
        social_profile_picture.length ? `${social_profile_picture}?width=200&height=200` : null
    );

    const isDefaultProfilePic = profilePic && profilePic.indexOf('profile_images/default-user.jpg') !== -1;

    const hasProperties = (
        (owns_properties && owns_properties.length > 0) ||
        (manages_properties && manages_properties.length > 0)
    );

    const hasExperiences = (
        (owns_experiences && owns_experiences.length > 0) ||
        (manages_experiences && manages_experiences.length > 0)
    );

    const isHost = (
        hasProperties ||
        hasExperiences
    );

    const age = dob.year && moment().diff(moment(dob.year, 'YYYY'), 'years');

    return {
        bookings,
        email,
        phone: details.phone_number,
        gender: details.gender,
        dateOfBirth: dob,
        age,
        name: full_name,
        ownerPropertyIntro: details.about,
        quote: about || details.about,
        profilePic,
        isDefaultProfilePic,
        propertyImages: additional_pictures.map(imageSetTransform),
        url,
        groups: groups_joined,
        groupsInfo: groups_joined_info,
        fullName: full_name,
        city: details.city,
        state: details.state,
        country: details.country,
        streetAddress: details.street_address,
        terms: details.terms_accepted,
        firstName: first_name,
        lastName: last_name,
        isHost,
        hasProperties,
        hasExperiences,
        canCreateHostOrder
    };
};

export const userPropType = shape({
    bookings: arrayOf(string),
    fullName: string,
    ownerPropertyIntro: string,
    propertyImages: arrayOf(imageSetPropType),
    isHost: bool,
    url: string
});
