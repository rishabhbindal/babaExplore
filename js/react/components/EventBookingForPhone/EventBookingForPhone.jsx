import React, { PropTypes } from 'react';

import EventBookingContainer from '../../containers/EventBookingContainer.jsx';
import { eventPropertyType } from '../../data-shapes/property.js';
import Modal from '../Modal/Modal.jsx';

import './EventBookingForPhone.scss';
import IsNotDisplayNone from '../IsNotDisplayNone.jsx';

class EventBookingForPhone extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isOpen: false };
        this.showModal = this.showModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
    }

    showModal() {
        const { isLoggedIn, showLoginModal } = this.props;

        if (!isLoggedIn) {
            showLoginModal();
            return;
        }
        this.setState({ ...this.state, isOpen: true });
    }

    hideModal() {
        this.setState({ ...this.state, isOpen: false });
    }

    render() {
        return (
            <div>
                <button
                  className="EventBookingForPhone__floatingButton"
                  onClick={this.showModal}
                >
                    Join the event
                </button>
                { this.props.property.url && (
                    <Modal
                      klassName='MobileBooking-modal'
                      isOpen={this.state.isOpen}
                      closeModal={this.hideModal}
                      titleNode={(
                          <div className="EventBookingForPhone__header">
                              <h1>Booking</h1>
                          </div>
                      )}
                    >
                          <IsNotDisplayNone>
                              <EventBookingContainer property={this.props.property} />
                          </IsNotDisplayNone>
                    </Modal>
                )}
            </div>
        );
    }
}

EventBookingForPhone.propTypes = {
    property: eventPropertyType,
    isLoggedIn: PropTypes.bool,
    showLoginModal: PropTypes.func
};

export default EventBookingForPhone;
