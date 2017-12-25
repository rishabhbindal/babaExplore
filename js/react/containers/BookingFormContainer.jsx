import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm, getFormValues, Field, SubmissionError } from 'redux-form';

import BottomBookingDisabledInput from '../components/BottomBookingDisabledInput/BottomBookingDisabledInput.jsx';

import { appState, appActions } from '../reducers';
import BookingDatePairForm from '../components/BookingDatePairForm/BookingDatePairForm.jsx';
import { bookablesBill, customPriceTotal } from '../lib/computeBookablePrices.js';
import bookingButtonText from '../lib/bookingButtonText.js';
import ButtonLoader from '../components/ButtonLoader/ButtonLoader.jsx';
import BookingBreakup from '../components/BookingBreakup/BookingBreakup.jsx';
import CouponFormContainer from './CouponFormContainer.jsx';
import { orderStates, bookableTypes } from '../constants/enumConstants.js';
import RazorpayScriptLoader from '../components/RazorpayScriptLoader.jsx';
import ToolTip from '../components/ToolTip/ToolTip.jsx';
import PaypalScriptLoader from '../components/PaypalScriptLoader/PaypalScriptLoader.jsx';

const toInt = n => parseInt(n, 10);

const FORM_NAME = 'booking';

const validate = ({ date }) => {
    if (!date || !date.from) {
        throw new SubmissionError({
            date: {
                from: 'Please choose the check in date',
                _now: new Date()
            }
        });
    }

    if (!date || !date.until) {
        throw new SubmissionError({
            date: {
                until: 'Please choose the check out date',
                _now: new Date()
            }
        });
    }
};

/* const formSelector = formValueSelector(FORM_NAME);*/

const mapStateToProps = (store, { propertyId, propertyType }) => {
    const { quantityMap, date } = getFormValues(FORM_NAME)(store) || {};
    const gatewayCharge = appState.appConfig.getServiceChargeRate(store);
    const isLoggedIn = appState.session.hasSession(store);
    const order = isLoggedIn && appState.order.getExistingValidOrder(store, propertyId);
    const coupon = appState.coupon.getCoupon(store);
    // need to implement support for coupons and explore fee when custom price is set
    const exploreFee = order && Object.values(order.quantityMap)
        .reduce((sum, qMap) => (sum + qMap.explore_fee), 0);
    const customPrice = {
        hasCustomPrice: order && order.hasCustomPrice,
        cost: order && order.cost,
        downpaymentCost: order && (order.downpaymentCost + exploreFee)
    };

    const buttonText = bookingButtonText(propertyType, order && order.state);

    const isInProgress = appState.order.isInProgress(store, order && order.id);

    return {
        bookings: quantityMap,
        buttonText,
        coupon,
        date,
        gatewayCharge,
        isInProgress,
        isLoggedIn,
        orderState: order && order.state,
        customPrice
    };
};

class BookingFormContainer extends React.Component {
    static propTypes = {
        propertyId: PropTypes.number.isRequired,
        isLoggedIn: PropTypes.bool.isRequired,
        isInProgress: PropTypes.bool.isRequired,
        percentFee: PropTypes.shape({
            enabled: PropTypes.bool,
            val: PropTypes.number
        }).isRequired,
        fetchExistingLoveRequests: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleEndChange = this.handleEndChange.bind(this);
        this.toggleBreakup = this.toggleBreakup.bind(this);
        this.toggleViewType = this.toggleViewType.bind(this);
        this.state = {
            isShortView: false,
            startDate: null,
            endDate: null,
            showBreakup: false
        };
    }

    componentDidMount() {
        if (this.props.isLoggedIn) {
            this.props.fetchExistingLoveRequests(this.props.propertyId);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.isLoggedIn || nextProps.isLoggedIn === this.props.isLoggedIn) {
            return;
        }
        this.props.fetchExistingLoveRequests(this.props.propertyId);
    }

    handleStartChange(startDate) {
        this.setState({ startDate });
    }

    handleEndChange(endDate) {
        this.setState({ endDate });
    }

    toggleBreakup(e) {
        e.preventDefault();
        this.setState({ showBreakup: !this.state.showBreakup });
    }

    toggleViewType(e) {
        e.preventDefault();
        this.setState({ isShortView: !this.state.isShortView });
    }

    render() {
        const {
            bookables,
            bookings,
            buttonText,
            coupon,
            date,
            gatewayCharge,
            isInProgress,
            orderState,
            customPrice,
            percentFee
        } = this.props;

        const chosenBookings = Object.entries(bookings || {}).reduce((acc, [id, b]) => {
            if (!b.isChosen) {
                return acc;
            }

            return { ...acc, ...{ [id]: b } };
        }, {});

        const chosenBookables = bookables && bookables.filter(({ id }) => {
            const booking = bookings && bookings[id];
            return booking && booking.isChosen;
        });

        const isDayLounge = chosenBookables.every(({ bookableType }) => bookableTypes.PACKAGE === bookableType);

        let days;
        if (date && date.from && date.until) {
            days = date.until.diff(date.from, 'days');
        }

        if (isDayLounge) {
            days = days + 1;
        }

        const totals = bookings && bookables && bookablesBill({
            bookables,
            requests: chosenBookings,
            days: days || 1,
            gatewayCharge,
            coupon
        });

        const guests = chosenBookables.map(({ id, stay }) => {
            const booking = bookings && bookings[id];

            const perBooking = toInt(stay.perInstanceGuests);
            const extraGuests = toInt(booking.extraGuests) || 0;
            const quantity = booking.requested || 1;

            return (quantity * perBooking) + extraGuests;
        }).reduce((acc, g) => acc + g, 0);

        const { handleSubmit } = this.props;

        const onSubmit = params => {
            validate(params);
            return this.props.onSubmit({ date, quantityMap: chosenBookings });
        };

        if (!Object.keys(chosenBookings).length) {
            return null;
        }

        const hasCustomPrice = customPrice.hasCustomPrice;
        const customTotals = customPriceTotal({
            totals,
            customPrice,
            coupon,
            gatewayCharge,
            percentFee
        });
        const total = !hasCustomPrice ? (totals && totals.bill.total) : customTotals.bill.total;

        const totalStr = `₹${total}`;

        const couponEl = totals && orderState === orderStates.ACCEPTED &&
            <CouponFormContainer totals={totals.bill} shortDescription yellowLinks />;

        const showBreakupEl = totals &&
            <a
              href="javascript:;"
              onClick={this.toggleBreakup}
              className="washed-blue hover-light-yellow underline"
            >{this.state.showBreakup ? 'Hide' : 'Show'} price breakup</a>;

        const shortView = this.state.isShortView;

        return (
            <RazorpayScriptLoader>
            <PaypalScriptLoader>
            <form
              key="booking-form"
              onSubmit={handleSubmit(onSubmit)}
              className="shadow-1 bg-elt-blue ph4 pv2 flex flex-wrap"
            >
                <div className="w-100 tr dn-ns">
                    <button
                      className="black-60 bold pa1 shadow-1 pointer"
                      onClick={this.toggleViewType}
                    >
                        {shortView ? '▲' :  '▼'}
                    </button>
                </div>

                {
                    !shortView && (
                        <div className="w-100 w-70-ns">
                            <span className="fl w-100 w-50-l ph4-m">
                                <Field
                                  name="date"
                                  disabled={isInProgress}
                                  component={props => <BookingDatePairForm single={isDayLounge}  {...props} />}
                                />
                            </span>


                            <div className="fl w-100 w-50-l ph4-m">
                                <div className="fl w-100 w-60-l ph2-l b--white-40 cf bb3 bb-0-l pv3 pv0-l mb3 pb0-l">
                                    {
                                        !isDayLounge && (
                                            <span className="fl w-50 ph2-l bl-l b--white-10">
                                                <div className="f4 b white-80 white-l dib db-l">Nights</div>
                                                <div className="w3 dib db-l">
                                                    <div className="dn dib-l">
                                                        <BottomBookingDisabledInput value={days} />
                                                    </div>
                                                    <div className="dib dn-l f3 ml2 white sans-serif b">
                                                        {days}
                                                    </div>
                                                </div>
                                            </span>
                                        )
                                    }
                                            <span className="fl w-50 ph2 bl-l b--white-10">
                                                <div className="f4 b white-80 white-l dib db-l">People</div>
                                                <div className="w3 dib db-l">
                                                    <div className="dn dib-l">
                                                        <BottomBookingDisabledInput value={guests} />
                                                    </div>
                                                    <div className="dib dn-l f3 ml2 white sans-serif b">
                                                        {guests}
                                                    </div>
                                                </div>
                                            </span>
                                </div>


                                <div className="fl w-100 dn-ns">
                                    <div>
                                        {couponEl}
                                        {showBreakupEl}
                                    </div>
                                    <BookingBreakup
                                      nights={days}
                                      totals={totals}
                                      bookables={bookables}
                                      bookings={chosenBookings}
                                      showDetails={this.state.showBreakup}
                                      customPrice={customPrice}
                                      coupon={coupon}
                                      gatewayCharge={gatewayCharge}
                                      customTotals={customTotals}
                                      closeBreakUp={this.toggleBreakup}
                                    />
                                </div>

                                <div className="fl w-100 w-40-l bb-0-l cf bl-l b--white-10 mb3 flex flex-wrap tr tl-ns">
                                    <div className="fl f4 b ph2-l white-80 white-l self-center w-50 w-100-l">
                                        { !hasCustomPrice ? 'Total' : (
                                              <span>
                                                  Custom Price
                                                  <ToolTip>
                                                      <p className="bg-gray shadow-1 pa1" >
                                                          Custom Price set by Host for this booking
                                                      </p>
                                                  </ToolTip>
                                              </span>
                                          )
                                        }
                                    </div>
                                    <div className="fl w-100-l w-50 ph2">
                                        <div className="dn dib-l">
                                            <BottomBookingDisabledInput bold value={totalStr} />
                                        </div>
                                        <div className="dib dn-l f2 b white sans-serif">
                                            {totalStr}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                <div className="w-100 w-30-ns ph2-ns mb3 mb0-ns self-center">
                    {
                        shortView && (
                            <div className="dn-l f2 b white sans-serif tc">
                                {totalStr}
                            </div>
                        )
                    }
                    <ButtonLoader
                      expanded
                      showSpinner={isInProgress}
                      size="large"
                      bgColor="green"
                      boldTxt
                    >
                        {buttonText}
                    </ButtonLoader>
                    <div className="w-100 dn db-ns">
                        {couponEl}
                        {showBreakupEl}
                    </div>
                </div>
                {
                    !shortView && (
                        <div className="bg-light-gray w-100 dn db-ns">
                            <div className="w-40" style={{ marginLeft: '27%' }}>
                                <BookingBreakup
                                  nights={days}
                                  totals={totals}
                                  bookables={bookables}
                                  bookings={chosenBookings}
                                  showTotal
                                  showDetails={this.state.showBreakup}
                                  customPrice={customPrice}
                                  coupon={coupon}
                                  gatewayCharge={gatewayCharge}
                                  customTotals={customTotals}
                                  closeBreakUp={this.toggleBreakup}
                                />
                            </div>
                        </div>
                    )
                }
            </form>
            </PaypalScriptLoader>
            </RazorpayScriptLoader>
        );
    }
}

export default connect(mapStateToProps, {
    onSubmit: appActions.order.requestClick,
    fetchExistingLoveRequests: appActions.order.fetchExistingLoveRequests
})(
    reduxForm({
        form: FORM_NAME
    })(BookingFormContainer)
);
