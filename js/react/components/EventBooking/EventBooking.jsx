import { Field, reduxForm, propTypes as formPropTypes } from 'redux-form';
import React, { PropTypes } from 'react';

import './EventBooking.scss';
import InfoIcon from '../Icons/InfoIcon.jsx';

import CouponFormContainer from '../../containers/CouponFormContainer.jsx';
import DateInfo from '../DateInfo/DateInfo.jsx';
import ELTNumInput from '../ELTNumInput/ELTNumInput.jsx';
import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import PriceEl from '../PriceEl/PriceEl.jsx';
import BookingTableRow from '../BookingTableRow/BookingTableRow.jsx';


import { bookableTypes, orderStates } from '../../constants/enumConstants.js';
import { eventPropertyType } from '../../data-shapes/property.js';
import { orderPropType } from '../../data-shapes/order.js';
import bookingButtonText from '../../lib/bookingButtonText.js';
import idFromURLEnd from '../../lib/idFromURLEnd.js';
import spotsAvailable from '../../lib/spotsAvailable';
import { customPriceTotal } from '../../lib/computeBookablePrices.js';

import messages from '../../constants/messages.js';

// need to implement support for coupons and explore fee when custom price is set
const BookingTotals = ({ totals, couponField, hasCustomPrice, customTotals }) => {
    if (!totals || !totals.bill) {
        return null;
    }

    const { cost, total } = totals.bill;
    const applicableBill = hasCustomPrice ? customTotals : totals;
    const { gatewayFee } = applicableBill.bill;
    const bookingPriceLabel = (
        <span>
            Price
            <div className="EventBooking__tooltip">
                <InfoIcon />
                <p className="EventBooking__tooltipText">Number of Tickets multiplied by price</p>
            </div>
        </span>
    );

    return (
        <table className="EventBooking__table">
            <tbody>
                {hasCustomPrice && <BookingTableRow
                  whole={
                      <p style={{ textAlign: 'center', fontWeight: '600' }}>
                          Host has set Custom Price for this booking</p>
                  }
                />}
                <BookingTableRow
                  left={bookingPriceLabel}
                  right={<PriceEl price={cost} />}
                />
                { hasCustomPrice &&
                    <BookingTableRow
                      left={<span style={{ fontWeight: 600 }}>Price set by Host</span>}
                      right={customTotals.bill.cost}
                    />
                }
                { !!couponField && <BookingTableRow
                  whole={couponField}
                /> }
                <BookingTableRow
                  withBottomBorder
                  left="Payment gateway fees"
                  right={<PriceEl price={gatewayFee} />}
                />
                <BookingTableRow
                  left="Total"
                  right={<PriceEl bold lineThrough={hasCustomPrice} price={total} />}
                />
                { hasCustomPrice && <BookingTableRow
                  left="Custom Price"
                  right={<PriceEl
                    bold
                    price={customTotals.bill.total}
                  />}
                />}
            </tbody>
        </table>
    );
};

const BookableField = ({ bookable, index }) => (
    <span>
        <Field
          type="tel"
          min={0}
          autoFocus={index === 0}
          max={bookable.availableInstances}
          name={`bookable-${idFromURLEnd(bookable.url)}`}
          placeholder={1}
          component={ELTNumInput}
        />
        <small>person</small>
    </span>
);

const BookableLabel = ({ bookable }) => (
    <div>
        <div className="EventBooking__name">
            {bookable.bookableInstanceLabel}
        </div>
        {
            bookable.availableInstances ? (
                <div className="EventBooking__desc">
                    {bookable.availableInstances} spots availabe
                </div>
            ) : 'House full, no spots left'
        }
    </div>
);

class BookingF extends React.Component {
    render() {
        const { property, handleSubmit } = this.props;

        const bookablesRows = property.bookables.map((b, i) => (
            <tr key={b.url}>
                <td> <BookableField bookable={b} index={i} /> </td>
                <td> <BookableLabel bookable={b} /></td>
                <td className="text-align--right"> <PriceEl price={b.ticketPrice} bold /> </td>
            </tr>
        ));

        return (
            <form onSubmit={handleSubmit}>
                <table className="EventBooking__table">
                    <tbody>
                        {bookablesRows}
                    </tbody>
                </table>
            </form>
        );
    }
}

BookingF = reduxForm({
    form: 'booking-form',
    enableReinitialize: true,
    keepDirtyOnReinitialize: true
})(BookingF);

const WaitingListBtn = ({ showWaitingListButton, waitingList, onSubmitBooking, bookableId, email }) => {
    if (!showWaitingListButton) {
        return null;
    }

    let showSpinner = false;
    if (waitingList.loading) {
        showSpinner = true;
    }

    const btnText = waitingList.joined ? 'On Waiting List' : 'Join Waiting List';

    return (
        <div className="EventBooking__waitinglist__btn">
            <ButtonLoader
              onClick={onSubmitBooking}
              type="submit"
              size="large"
              disabled={waitingList.joined}
              expanded
              showSpinner={showSpinner}
            >
                {btnText}
            </ButtonLoader>
        </div>
    );
};

WaitingListBtn.propTypes = {
    showWaitingListButton: PropTypes.bool,
    waitingList: PropTypes.shape({
        joined: PropTypes.bool,
        loading: PropTypes.bool
    }),
    bookableId: PropTypes.string,
    onSubmitBooking: PropTypes.func
};

let BookingForm = (props) => {
    const { property, order, showWaitingListButton, waitingList, bookableId, email, bookingFull, bookingClosed, gatewayCharge, coupon, totals } = props;
    const { onSubmitBooking, joinWaitingList, fetchWaitingListStatus, showMessageModal, toggleLoginModalVisibility } = props;
    const { invalid, isInProgress } = props;

    const bookableTypeList = property.bookables.map(b => b.bookableType);
    const hasCustomPrice = order && order.hasCustomPrice;
    const exploreFee = order && order.quantityMap && Object.values(order.quantityMap)
    .reduce((sum, qMap) => (sum + qMap.explore_fee), 0);
    const customTotals = hasCustomPrice ? customPriceTotal({
        customPrice: {
            cost: order.cost,
            downpaymentCost: order.downpaymentCost + exploreFee
        },
        totals,
        coupon,
        gatewayCharge,
        percentFee: property.percentFee
    }) : {};
    const couponEl = (!property.instabook && (!order || order.state !== orderStates.ACCEPTED)) ? null :
        <CouponFormContainer totals={hasCustomPrice ? customTotals.bill : totals.bill} />;

    const buttonText = bookingClosed ? 'Booking Closed' :
        bookingButtonText(bookableTypeList, order && order.state, property.instabook, bookingFull);

    const submit = () => {
        if (!email) {
            toggleLoginModalVisibility(true);
            return Promise.resolve();
        }
        return joinWaitingList(email, bookableId)
            .then(() => { fetchWaitingListStatus(bookableId); })
            .catch((e) => {
                console.error(e);
                showMessageModal(
                    'Message',
                    messages.errors.WAITING_LIST_JOIN
                );
            });
    };

    return (
        <div>
            <BookingF
              {...props}
              onSubmit={props.onSubmit}
              initialValues={props.initialValues}
            />

            <BookingTotals
              totals={totals}
              property={property}
              couponField={couponEl}
              hasCustomPrice={hasCustomPrice}
              customPrice={order}
              customTotals={customTotals}
            />

            <ButtonLoader
              onClick={onSubmitBooking}
              type="submit"
              disabled={isInProgress || (order && order.state) === orderStates.PAYMENT_CONFIRMED || bookingClosed || bookingFull}
              size="large"
              expanded
              showSpinner={isInProgress}
            >
                {buttonText}
            </ButtonLoader>
            <WaitingListBtn
              showWaitingListButton={showWaitingListButton}
              waitingList={waitingList}
              onSubmitBooking={submit}
              bookableId={bookableId}
              email={email}
            />
        </div>
    );
};
BookingForm.propTypes = {
    order: orderPropType,
    property: eventPropertyType,
    onSubmitBooking: PropTypes.func,
    joinWaitingList: PropTypes.func,
    fetchWaitingListStatus: PropTypes.func,
    showMessageModal: PropTypes.func,
    toggleLoginModalVisibility: PropTypes.func,
    showWaitingListButton: PropTypes.bool,
    waitingList: PropTypes.shape({
        joined: PropTypes.bool,
        loading: PropTypes.bool
    }),
    bookableId: PropTypes.string,
    email: PropTypes.string
};

class EventBooking extends React.Component {
    render() {
        const { property, coupon, isValidatingCoupon, waitingList, email, gatewayCharge } = this.props;
        const { onSubmitBooking, submitBooking, joinWaitingList, fetchWaitingListStatus, showMessageModal, toggleLoginModalVisibility } = this.props;
        const { totals } = this.props;

        if (!property) {
            return null;
        }

        const bookingFull = !spotsAvailable(property);
        const bookingClosed = new Date().setHours(0, 0, 0, 0) > new Date(property.eventDate);
        const showWaitingListButton = bookingFull || bookingClosed;
        const bookableId = idFromURLEnd(property.bookables[0].url);

        /* check if member_only_booking */
        return (
            <section className="EventBooking shadow-1">
                <div className="EventBooking__bg">
                    <h5>
                        <DateInfo date={property.eventDate} />
                    </h5>
                    <p>
                        {property.locality && `${property.locality}, `} {property.city}
                    </p>

                    <BookingForm
                      initialValues={this.props.formInitialValues}
                      order={this.props.order}
                      property={property}
                      quantityMap={this.props.quantityMap}
                      coupon={coupon}
                      onSubmit={submitBooking}
                      isValidatingCoupon={isValidatingCoupon}
                      isInProgress={this.props.isInProgress}
                      onSubmitBooking={onSubmitBooking}
                      totals={totals}
                      showWaitingListButton={showWaitingListButton}
                      waitingList={waitingList}
                      bookableId={bookableId}
                      joinWaitingList={joinWaitingList}
                      email={email}
                      fetchWaitingListStatus={fetchWaitingListStatus}
                      showMessageModal={showMessageModal}
                      toggleLoginModalVisibility={toggleLoginModalVisibility}
                      bookingFull={bookingFull}
                      bookingClosed={bookingClosed}
                      gatewayCharge={gatewayCharge}
                    />
                </div>
            </section>
        );
    }
}

EventBooking.propTypes = eventPropertyType.isRequired;

export default EventBooking;
