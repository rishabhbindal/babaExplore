import { PropTypes } from 'react';

const { string, shape } = PropTypes;

export const promotedListType = shape({
    caption: string
});

const promotedSearchPages = item => ({
    url: item.clickable_url && item.clickable_url.replace(/^.*\/\/[^\/]+/, ''),
    svg: item.svg,
    image: item.image,
    name: item.name
});

export const promotedListTransform = ({
  caption,
  cities,
  cm_images,
  description_map,
  events,
  groups,
  icons,
  images,
  press,
  properties,
  reviews,
  strings
}) => ({
    caption,
    cities,
    cm_images,
    description_map,
    events,
    groups,
    promotedSearchPages: icons.map(promotedSearchPages),
    images,
    press,
    properties,
    reviews,
    strings,
    hostVideos: description_map.hostVideos && description_map.hostVideos.sort((v1, v2) =>
        v1.ordering > v2.ordering ? 1 : v1.ordering < v2.ordering ? -1 : 0),
    seoData: description_map.seoData
});

export const newsItemTransform = ({
  url,
  caption,
  external_url,
  description,
  image
}) => {
    const coverImage = image && image.image;
    return {
        url,
        caption,
        external_url,
        description,
        coverImage
    };
};

export const homePagePropertyTransform = ({
  url,
  caption,
  city,
  state,
  listing_type,
  image,
  owner,
  code
}) => {
    const location = `${city} ${state}`;

    const coverImage = image ? {
        src: image.image,
        caption: image.caption
    } : null;

    return {
        url,
        caption,
        location,
        coverImage,
        owner,
        listingType: listing_type,
        code
    };
};

export const homePageGroupTransform = ({
  url,
  image,
  status,
  name
}) => {
    const coverImage = image && {
        custom: image.image_custom,
        src: image.image,
        caption: image.caption
    };

    const isPublished = (status === 'PUBLISHED');

    return {
        url,
        name,
        isPublished,
        coverImage
    };
};

export const supportedCitiesTransform = ({
  city,
  state,
  country,
  url
}) => {
    const location = [city, state].filter(Boolean).join(', ');

    return {
        city,
        state,
        country,
        location,
        url
    };
};

export const specialEventTransform = ({
    image,
    property_code
}) => ({
    specialEventImage: {
        src: image.image_custom,
        caption: image.caption
    },
    property_code
});
