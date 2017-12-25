import cls from 'classnames';
import React, { PropTypes } from 'react';
import { withRouter, Link } from 'react-router-dom';
import PriceEl from '../PriceEl/PriceEl.jsx';
import Button from '../Button/Button.jsx';

import { customPriceTotal } from '../../lib/computeBookablePrices.js';

/* import './BookingBreakup.scss';*/

const toInt = n => parseInt(n, 10);

const row = (left, right, { bold, strike } = {}) => (
    <div className={cls('cf')}>
        <div className={cls('fl w-75 gray', bold && 'b')}>{left}</div>
        {right && <div className={cls('fl w-25', bold && 'b', strike && 'strike')}>{<PriceEl price={right} />}</div>}
    </div>
);

const BookableBreakup = ({ bookable: { id, bookableInstanceLabel, pricing }, booking, nights }) => {
    let extraGuestsEl;

    const nightsTxt = `x ${nights} night${nights > 1 ? 's' : ''}`;

    if (booking.extraGuests && pricing.guestCharge > 0) {
        extraGuestsEl = (
            <div>
                <PriceEl price={pricing.guestCharge} /> x {booking.extraGuests} guest{booking.extraGuests > 1 ? 's' : ''} {nightsTxt}
            </div>
        );
    }


    let roomTxt = '';
    if (toInt(booking.requested) > 1) {
        roomTxt = <span>x {booking.requested} Rooms</span>;
    }

    const bookablePrice = (
        <div>
            <PriceEl price={pricing.ticketPrice} /> {roomTxt} {nightsTxt}
        </div>
    );

    /* const toBookable = Object.assign({}, location, { hash: `#bookable-${id}` });*/
    const bookableLinkEl = <div className="elt-green link">{bookableInstanceLabel}</div>;

    return (
        <div className="bb b--black-20 pt1">
            <div className="text-left">
                {row(bookableLinkEl, null, { bold: true, bborder: false })}
            </div>
            {row(bookablePrice, pricing.ticketPrice * nights * toInt(booking.requested))}
            {booking.extraGuests > 0 && pricing.guestCharge > 0 && row(extraGuestsEl, pricing.guestCharge * booking.extraGuests * nights)}
        </div>
    );
};

const getBookable = (booakbles, id) =>
    booakbles.find(b => toInt(b.id) === toInt(id));


class BookingBreakup extends React.Component {
    static propTypes = {
    }

    render() {
        const { nights, totals, bookables, bookings, showTotal, showDetails, customPrice, customTotals } = this.props;
        const { closeBreakUp } = this.props;

        if (!totals || !totals.bill) {
            return null;
        }
        const { cost } = totals.bill;
        const applicableBill = customPrice.hasCustomPrice ? customTotals.bill : totals.bill;
        const { gatewayFee, exploreFee, discount, discountedCost } = applicableBill;

        const bookableBreakups = Object.entries(bookings).map(([id, b]) =>
            <BookableBreakup
              bookable={getBookable(bookables, id)}
              booking={b}
              nights={nights || 1}
            />
        );

        const hasDiscount = discount > 0;

        return (
            <div className="w-100 tc mw6-ns center">
                <div className={cls('bg-light-gray ph3 pv2 tr ', showDetails ? 'db' : 'dn')}>
                    <div className="cb">
                        <span onClick={closeBreakUp} style={{ cursor: 'pointer' }}>[ X ]</span>
                    </div>
                    {bookableBreakups}

                    <div className="bb b--black-60">
                        {row('Price', cost, { bold: !hasDiscount, strike: customPrice.hasCustomPrice })}
                        {customPrice.hasCustomPrice &&
                            row('Price set by Host', customTotals.bill.cost, { bold: !hasDiscount })}
                        {hasDiscount && row('Discount', -discount)}
                        {hasDiscount && row('Discounted price', discountedCost, { bold: true })}
                    </div>

                    { /* dont show explore fee to guests */}
                    <div className={cls(showTotal && 'bb b--black-80')}>
                        {row('Payment gateway', gatewayFee)}
                    </div>
                    <div className={cls('ph1 pt1', showTotal ? 'db' : 'dn')}>
                        {showTotal && row('Total', totals.bill.total, { bold: true, strike: customPrice.hasCustomPrice })}
                        {customPrice.hasCustomPrice && row('Custom Price', customTotals.bill.total)}
                    </div>
                </div>
            </div>
        );
    }
}

export default BookingBreakup;
