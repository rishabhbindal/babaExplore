import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { eventPropertyType } from '../data-shapes/property.js';
import { actions as appActions, getState as appState } from '../reducers';

import GuestListMainBody from '../components/GuestListMainBody/GuestListMainBody.jsx';

const mapStateToProps = (state, { match }) => {
    const propertyCode = match.params.eventCode;
    const property = appState.event.getProperty(state, propertyCode) || {};
    const guests = appState.event.getGuests(state) || [];

    return { propertyCode, property, guests };
};

class GuestListMainBodyContainer extends React.Component {
    static propTypes = {
        fetchEventListing: PropTypes.func.isRequired,
        fetchGuests: PropTypes.func.isRequired,
        property: eventPropertyType.isRequired
    }

    static defaultProps = {
        guests: []
    }

    componentWillMount() {
        this.fetchData();
    }

    fetchData(newProps) {
        const props = newProps || this.props;
        if (props.propertyCode) {
            this.props.fetchEventListing(props.propertyCode)
                .then(() => {
                    const { id, eventDate } = this.props.property;
                    return this.props.fetchGuests(id, eventDate);
                });
        }
    }

    render() {
        return <GuestListMainBody {...this.props} />;
    }
}

export default connect(mapStateToProps, {
    fetchEventListing: appActions.event.fetchEventListing,
    fetchGuests: appActions.event.fetchGuests
})(GuestListMainBodyContainer);
