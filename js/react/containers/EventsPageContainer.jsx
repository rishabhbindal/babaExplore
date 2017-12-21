import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import { actions, getState as appState } from '../reducers';
import { eventPropertyType } from './../data-shapes/property.js';
import { userPropType } from './../data-shapes/user.js';
import EventMainBody from '../components/EventMainBody/EventMainBody.jsx';
import EventMastHead from '../components/EventMastHead/EventMastHead.jsx';
import MessageModalContainer from './MessageModalContainer.jsx';
import ModalBookingSuccessContainer from './ModalBookingSuccessContainer.jsx';
import ModalBookingUserMessage from './ModalBookingUserMessage.jsx';
import SocialShare from '../components/SocialShare/SocialShare.jsx';
import EventPageHelmet from '../components/EventPageHelmet.jsx';
import MissingDetailsModalContainer from './MissingDetailsModalContainer.jsx';

const findFn = (arr, fn) => {
    for (let i = 0; i < arr.length; i += 1) {
        if (fn(arr[i])) {
            return arr[i];
        }
    }

    return null;
};

const getMastProfiles = (guests, promotedUsers) => {
    if (!guests || !guests.length) {
        return promotedUsers || [];
    }
    if (!promotedUsers || !promotedUsers.length) {
        return guests;
    }

    const allGuests = promotedUsers.concat(guests);

    return allGuests.reduce((acc, guest) => {
        if (findFn(acc, g => g.name === guest.name)) {
            return acc;
        }
        return acc.concat(guest);
    }, []);
};

const mapStateToProps = (state, { match }) => {
    const { event, user } = state;
    const propertyCode = match.params.eventCode;
    const property = appState.event.getProperty(state, propertyCode) || {};
    const guests = event.guests.guestList || [];
    const topGuests = getMastProfiles(guests, property.promotedUsers).slice(0, 3);
    /* const fetchingGuests = event.guests.fetching;*/
    const owner = appState.user.getUserByURL(state, property.owner) || {};
    const isLoading = user.fetching;

    const { mastImage } = property;
    const { propertyImages } = owner;
    const img = mastImage || (propertyImages && propertyImages[0]);
    const cancellationPolicies = appState.event.getCancellationPolicies(state);

    return { isLoading, owner, property, propertyCode, topGuests, guests, mastImage: img, cancellationPolicies };
};

class EventsPageContainer extends React.Component {
    static propTypes = {
        fetchAvailability: PropTypes.func.isRequired,
        fetchEventListing: PropTypes.func.isRequired,
        fetchGuests: PropTypes.func.isRequired,
        fetchUser: PropTypes.func.isRequired,
        fetchProperty: PropTypes.func.isRequired,
        fetchCancellationPolicies: PropTypes.func.isRequired,
        guests: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            profilePic: PropTypes.string,
            quote: PropTypes.string
        })),
        isLoading: PropTypes.bool,
        propertyCode: PropTypes.string,
        property: eventPropertyType,
        owner: userPropType,
        setCurrentProperty: PropTypes.func,
        topGuests: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            profilePic: PropTypes.string,
            quote: PropTypes.string
        })),
        cancellationPolicies: PropTypes.arrayOf(PropTypes.shape({
            name: PropTypes.string,
            details: PropTypes.string
        }))
    }

    componentDidMount() {
        this.props.setCurrentProperty(this.props.propertyCode);
        this.fetchData();
    }

    componentWillUnmount() {
        this.props.setCurrentProperty({});
    }

    fetchData() {
        let propertyPromise = Promise.resolve(null);
        if (!this.props.property.code) {
            propertyPromise = this.props.fetchEventListing(this.props.propertyCode);
        }

        propertyPromise.then(() => {
            const { code, id, eventDate } = this.props.property;

            return Promise.all([
                this.props.fetchProperty(this.props.propertyCode), /* a hack to make it work with order reducer changes */
                this.fetchOwner(),
                this.fetchGuests(),
                this.fetchCancellationPolicies(),
                this.props.fetchAvailability(code, id, eventDate)
            ]);
        });
    }

    fetchCancellationPolicies() {
        const { cancellationPolicies } = this.props;
        if (!cancellationPolicies || cancellationPolicies.length === 0) {
            return this.props.fetchCancellationPolicies();
        }
        return Promise.resolve(null);
    }

    fetchGuests() {
        const { guests } = this.props;
        const { id, eventDate } = this.props.property;
        if (!guests || guests.length === 0) {
            return this.props.fetchGuests(id, eventDate);
        }
        return Promise.resolve(null);
    }

    fetchOwner() {
        const { owner } = this.props;
        if (!owner || !owner.name) {
            return this.props.fetchUser(this.props.property.owner);
        }

        return Promise.resolve(null);
    }

    render() {
        const { property, owner, isLoading, topGuests, guests, cancellationPolicies } = this.props;

        return (
            <div>
                <EventPageHelmet property={property.code && property} />
                <EventMastHead property={property} topGuests={topGuests} mastImage={this.props.mastImage} />

                <SocialShare />

                <MessageModalContainer />
                <ModalBookingSuccessContainer />
                <ModalBookingUserMessage />
                <MissingDetailsModalContainer />

                <EventMainBody
                  property={property}
                  guests={guests}
                  owner={owner}
                  isLoading={isLoading}
                  cancellationPolicies={cancellationPolicies}
                />
            </div>
        );
    }
}

export default connect(mapStateToProps, {
    fetchEventListing: actions.event.fetchEventListing,
    fetchUser: actions.user.fetchUser,
    fetchGuests: actions.event.fetchGuests,
    fetchAvailability: actions.event.fetchEventListingAvailability,
    fetchProperty: actions.property.fetchProperty,
    setCurrentProperty: actions.property.setCurrentProperty,
    fetchCancellationPolicies: actions.event.fetchCancellationPolicies
})(EventsPageContainer);
