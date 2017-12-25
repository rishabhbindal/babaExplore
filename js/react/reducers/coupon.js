import { combineReducers } from 'redux';

import { Coupon } from '../lib/api.js';
import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';
import requestStateReducer from '../lib/requestReducerHelper.js';

import { couponTransform } from './../data-shapes/coupon.js';

export const types = {
    couponFetch: genFetchTypes('COUPON_FETCH'),
    couponReset: 'RESET_COUPON'
};

const couponReducer = (state = {}, { type, payload }) => {
    switch (type) {
    case types.couponFetch.SUCCESS:
        return { ...state, ...payload };
    case types.couponFetch.FAILURE:
        return payload;
    case types.couponReset:
        return {};
    default:
        return state;
    }
};

const actions = {
    validateCoupon: coupon => (dispatch) => {
        if (!coupon) {
            return Promise.resolve({});
        }

        return dispatch(simpleJSONFetchDispatcher({
            promiseFn: () => Coupon.validate(coupon),
            actionTypes: types.couponFetch,
            transform: res => couponTransform(res && res.results[0]),
            returnResponse: true
        }));
    },
    removeCoupon: () => ({
        type: 'RESET_COUPON'
    })
};

const getFns = {
    getCoupon: state => state.coupon,
    getIsValidatingCoupon: (state) => {
        const couponState = state.couponFetchState;
        return couponState && couponState.isFetching;
    }
};

export default {
    reducer: combineReducers({
        coupon: couponReducer,
        couponFetchState: requestStateReducer(types.couponFetch)
    }),
    actions,
    get: getFns
};
