import { PropTypes } from 'react';

import moment from 'moment';
import idFromURLEnd from '../lib/idFromURLEnd.js';

export const reviewType = {
    author: PropTypes.shape({
        name: PropTypes.string,
        thumbnail: PropTypes.string
    }),
    lastUpdated: PropTypes.string,
    review: PropTypes.string,
    url: PropTypes.string,
    orderUrl: PropTypes.string,
    orderId: PropTypes.string
};

export const reviewTransform = ({
    author_name,
    author_profile_picture,
    author_profile_thumbnail,
    author_social_picture,
    author_social_picture_cdn,
    last_updated,
    associated_order,
    review,
    url
}) => {
    const orderUrl = associated_order;
    return {
        orderUrl,
        orderId: orderUrl && idFromURLEnd(orderUrl),
        author: {
            name: author_name,
            thumbnail: author_profile_thumbnail
                || author_profile_picture
                || author_social_picture
                || author_social_picture_cdn
        },
        lastUpdated: moment(last_updated).format('MMM, YYYY'),
        review,
        url
    };
};
