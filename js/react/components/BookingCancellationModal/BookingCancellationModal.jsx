import React, { PropTypes } from 'react';

import { orderPropType } from '../../data-shapes/order.js';

import MessageModal from '../MessageModal/MessageModal.jsx';

import './BookingCancelModal.scss';

const BookingCancellationModal = ({ message, isOpen, closeModal, order, cancelOrder }) => {
    const cancel = () => {
        cancelOrder(order.id);
    };
    const wholeBody = (
        <div>
            {message}
            <div>
                <button onClick={closeModal} className="MessageModal__button BookingCancelModal__cancelbtn">
                    Cancel
                </button>
                <button onClick={cancel} className="MessageModal__button BookingCancelModal__cancelbtn">
                    Confirm
                </button>
            </div>
        </div>
    );
    return (
        <MessageModal
          title={<h5>Cancellation Policy</h5>}
          isOpen={isOpen}
          closeModal={closeModal}
          wholeBody={wholeBody}
        />
    );
};

BookingCancellationModal.propTypes = {
    message: PropTypes.string,
    isOpen: PropTypes.bool,
    closeModal: PropTypes.func,
    cancelOrder: PropTypes.func,
    order: orderPropType
};

export default BookingCancellationModal;

