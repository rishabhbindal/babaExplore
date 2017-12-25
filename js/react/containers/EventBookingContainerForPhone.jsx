import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { eventPropertyType } from '../data-shapes/property.js';
import { actions as appActions, getState as appState } from '../reducers';

import EventBookingForPhone from '../components/EventBookingForPhone/EventBookingForPhone.jsx';

const mapStateToProps = (state, ownProps) => {
    const isLoggedIn = appState.session.hasSession(state);
    const property = ownProps.property;
    return { property, isLoggedIn };
};

const mapDispatchToProps = dispatch => bindActionCreators({
    showLoginModal: () => appActions.login.toggleLoginModalVisibility(true)
}, dispatch);

class EventBookingContainerForPhone extends React.Component {
    render() {
        const { property, isLoggedIn, showLoginModal } = this.props;
        return property.url && (
            <EventBookingForPhone
              property={property}
              isLoggedIn={isLoggedIn}
              showLoginModal={showLoginModal}
            />
        );
    }
}

EventBookingContainerForPhone.propTypes = {
    property: eventPropertyType.isRequired,
    isLoggedIn: PropTypes.bool,
    showLoginModal: PropTypes.func
};

export default connect(mapStateToProps, mapDispatchToProps)(EventBookingContainerForPhone);
