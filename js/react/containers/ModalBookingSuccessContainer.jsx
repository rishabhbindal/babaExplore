import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import { actions as appActions, getState as appState } from '../reducers';
import DateInfo from '../components/DateInfo/DateInfo.jsx';
import MessageModal from '../components/MessageModal/MessageModal.jsx';
import PriceEl from '../components/PriceEl/PriceEl.jsx';
import BookingDateRange from '../components/BookingDateRange/BookingDateRange.jsx';
import { bookableTypes } from '../constants/enumConstants.js';

import { orderPropType } from '../data-shapes/order.js';

const mapStateToProps = (state) => {
    const isOpen = appState.modals.getIsBookingModalOpen(state);
    if (!isOpen) {
        return {};
    }

    const property = appState.property.getCurrentProperty(state);

    if (!property) {
        return {};
    }

    const orderId = appState.modals.getBookingOrderId(state);
    const order = appState.order.getOrderById(state, orderId);
    if (!order || !order.quantityMap) {
        return {};
    }

    return {
        bookables: property.bookables,
        caption: property.caption,
        isOpen,
        order,
        total: order.amount
    };
};

const getDateEl = ({ date, isRoom }) => {
    if (isRoom) {
        return [
            'Booking period:',
            <BookingDateRange alignLeft checkIn={date.from} checkOut={date.until} />
        ];
    }
    return [
        'Event date:',
        <DateInfo date={date.from} />
    ];
};

const ModalBookingSuccessContainer = (props) => {
    const { bookables, caption, isOpen, order, total } = props;
    const { closeModal, removeOrderState } = props;

    const title = (
        <div>
            <h1>Payment Successful</h1>
            <p>Please check your email inbox and spam for the confirmation mail.</p>
        </div>
    );

    const onClose = () => {
        removeOrderState(order && order.id);
        closeModal();
    };


    let fields = [];
    if (isOpen && order) {
        const { quantityMap, date } = order;
        const bookings = Object.keys(quantityMap).map(id => ({
            quantity: quantityMap[id],
            bookable: bookables.find(b => `${b.id}` === `${id}`)
        }));

        const isRoom = bookings.every(({ bookable }) => bookable.bookableType === bookableTypes.ROOM);

        const selection = bookings.map(({ bookable, quantity }) => [
            `${bookable.bookableInstanceLabel}:`,
            <div>For <span className="b">{quantity && (quantity.requested + quantity.extraGuests)}</span> people.</div>
        ]);

        fields = [
            ['Booking Id:', order && order.finalId],
            getDateEl({ date, isRoom }),
            ...selection,
            ['Total Price:', <PriceEl bold price={parseFloat(total)} />]
        ];
    }

    const body = (
        <div className="elt-green">
            <div className="">Thank you for booking at <span className="b">{caption}</span>. Here is your order summary.</div>
            <table className="collapse mv4 shadow-1" style={{ width: '100%' }}>
                <tbody>
                    {
                        fields.map(f => (
                            <tr key={f[0]} className="striped--light-gray">
                                <td className="tl ph2"> <div className="mv2"> {f[0]} </div> </td>
                                <td className="tl ph2"> <div> {f[1]} </div> </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    );

    return (
        <MessageModal
          klassName="Success-modal"
          title={title}
          closeModal={onClose}
          isOpen={isOpen && !!order}
          message={body}
        />
    );
};

ModalBookingSuccessContainer.propTypes = {
    bookables: PropTypes.arrayOf(PropTypes.object),
    caption: PropTypes.string,
    closeModal: PropTypes.func,
    isOpen: PropTypes.bool,
    order: orderPropType,
    removeOrderState: PropTypes.func,
    total: PropTypes.oneOfType([PropTypes.number, PropTypes.string])

};

export default connect(mapStateToProps, {
    closeModal: appActions.modals.hideBookingSuccess,
    removeOrderState: appActions.order.removeOrderState
})(ModalBookingSuccessContainer);
