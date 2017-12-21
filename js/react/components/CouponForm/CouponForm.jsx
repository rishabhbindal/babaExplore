import cls from 'classnames';
import React, { PropTypes } from 'react';
import {
    Field,
    propTypes as formPropTypes,
    reduxForm
} from 'redux-form';

import './CouponForm.scss';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import InputField from '../InputField/InputField.jsx';
import BookingTableRow from '../BookingTableRow/BookingTableRow.jsx';
import PriceEl from '../PriceEl/PriceEl.jsx';

import { actions as appActions } from '../../reducers';
import { couponState, chargeType } from '../../constants/enumConstants.js';
import { couponPropType } from '../../data-shapes/coupon.js';

const onValidateCoupon = ({ couponCode }, dispatch) => dispatch(appActions.coupon.validateCoupon(couponCode))
        .then((resp) => {
            if (resp.error) {
                throw {
                    couponCode: resp.error.message
                };
            }
        });

class CouponForm extends React.Component {
    static propTypes = {
        ...formPropTypes,
        removeCoupon: PropTypes.func,
        isPending: PropTypes.bool,
        coupon: couponPropType,
        totals: PropTypes.shape({
            discount: PropTypes.number,
            discountedCost: PropTypes.number
        })
    }
    constructor(props) {
        super(props);

        this.toggleCouponForm = this.toggleCouponForm.bind(this);
        this.removeCoupon = this.removeCoupon.bind(this);

        this.state = {
            couponFormOpen: false
        };
    }

    removeCoupon() {
        this.setState({ couponFormOpen: false });
        this.props.removeCoupon();
    }

    toggleCouponForm() {
        this.setState({ couponFormOpen: !this.state.couponFormOpen });
    }

    render() {
        const { handleSubmit, coupon, totals, isPending, shortDescription, yellowLinks } = this.props;

        const hasCoupon = coupon.state === couponState.VALID;
        const couponValueSuffix = (coupon.type === chargeType.PERCENT ? '%' : '');
        if (hasCoupon) {
            return (
                <div>
                    <div className="CouponControl">
                        <a className={cls('dib', yellowLinks && 'washed-blue hover-light-yellow underline')} href="javascript:;" onClick={this.removeCoupon}>Remove coupon</a>
                        <div
                          className={cls('pl2', !shortDescription ? 'dn' : 'dib')}
                        >{coupon.value}{couponValueSuffix} discount</div>
                    </div>
                    <div className={cls(shortDescription && 'dn')}>
                        <table style={{ width: '100%' }}>
                            <tbody>
                                <BookingTableRow
                                  left={`${coupon.code} (-${coupon.value}${couponValueSuffix})`}
                                  right={<PriceEl price={-totals.discount} />}
                                />
                                <BookingTableRow
                                  withBottomBorder
                                  left="Discounted price"
                                  right={<PriceEl price={totals.discountedCost} />}
                                />
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }

        return (
            <form onSubmit={handleSubmit(() => Promise.resolve())}>
                <div className="CouponControl">
                    <a className={cls(yellowLinks && 'washed-blue hover-light-yellow underline')} href="javascript:;" onClick={this.toggleCouponForm}>{this.state.couponFormOpen ? 'Hide' : 'Add' } coupon</a>
                </div>
                <div className="CouponField" style={{ display: this.state.couponFormOpen ? 'block' : 'none' }}>
                    <Field
                      type="text"
                      name="couponCode"
                      placeholder="Coupon code"
                      component={InputField}
                    />

                    <span className="CouponButton">
                        <ButtonLoader
                          size="small"
                          disabled={isPending}
                          showSpinner={isPending}
                        >
                            Apply
                        </ButtonLoader>
                    </span>
                    {hasCoupon && <div>Coupon Applied Successfully</div>}
                </div>
            </form>
        );
    }
}

export default reduxForm({
    form: 'coupon-form',
    asyncValidate: onValidateCoupon,
    asyncBlurFields: ['couponCode']
})(CouponForm);
