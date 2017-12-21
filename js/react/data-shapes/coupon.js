import { PropTypes } from 'react';
import moment from 'moment';

import { chargeType, couponState } from '../constants/enumConstants.js';
import strings from '../constants/strings.js';

export const couponTransform = ({
    redeemed_count,
    total_count,
    // created_at,
    code,
    type,
    valid_until,
    value
} = {}) => {
    if (!code) {
        return {
            error: {
                state: couponState.INVALID,
                message: strings.couponMessages.invalid
            }
        };
    }

    if (redeemed_count >= total_count) {          // eslint-disable-line camelcase
        return {
            error: {
                state: couponState.USED,
                message: strings.couponMessages.used
            }
        };
    }

    const validTill = moment(valid_until).endOf('day');

    if (moment().isAfter(validTill)) {
        return {
            error: {
                state: couponState.EXPIRED,
                message: strings.couponMessages.expired
            }
        };
    }

    return {
        code,
        state: couponState.VALID,
        value,
        type: type === 'PERCENT' ? chargeType.PERCENT : chargeType.AMOUNT
    };
};

export const couponPropType = PropTypes.shape({
    state: PropTypes.oneOf(Object.entries(couponState)),
    type: PropTypes.oneOf(Object.entries(chargeType)),
    value: PropTypes.number
});
