import { connect } from 'react-redux';

import { actions as appActions, getState as appState } from '../reducers';
import CouponForm from '../components/CouponForm/CouponForm.jsx';

const mapStateToProps = (state) => {
    const coupon = appState.coupon.getCoupon(state);
    const isPending = appState.coupon.getIsValidatingCoupon(state);
    return { coupon, isPending };
};

export default connect(mapStateToProps, {
    applyCoupon: appActions.coupon.validateCoupon,
    removeCoupon: appActions.coupon.removeCoupon
})(CouponForm);
