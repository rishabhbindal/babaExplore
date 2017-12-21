import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { submit, formValueSelector } from 'redux-form';
import React, { PropTypes } from 'react';

import { actions as appActions, getState as appState } from '../reducers';
import { bookablesBill } from '../lib/computeBookablePrices.js';
import EventBooking from '../components/EventBooking/EventBooking.jsx';
import { toInt, toObj } from '../lib/helpers.js';
import idFromURLEnd from '../lib/idFromURLEnd.js';
import { eventPropertyType } from '../data-shapes/property.js';
import RazorpayScriptLoader from '../components/RazorpayScriptLoader.jsx';
import PaypalScriptLoader from '../components/PaypalScriptLoader/PaypalScriptLoader.jsx';

const formSelector = formValueSelector('booking-form');

const mapStateToProps = (state, ownProps) => {
    const { code } = ownProps.property;

    const property = appState.event.getProperty(state, code) || {};
    const propertyAvailability = appState.event.getAvailability(state, code);
    const coupon = appState.coupon.getCoupon(state);
    const isValidatingCoupon = appState.coupon.getIsValidatingCoupon(state);
    const gatewayCharge = appState.appConfig.getServiceChargeRate(state);

    const userId = appState.session.userId(state);
    const user = appState.user.getUser(state, userId);
    const email = user && user.email;

    const isLoggedIn = appState.session.hasSession(state);
    /* only if logged in */
    const getPropertyFieldValue = id => toInt(formSelector(state, `bookable-${id}`) || 0);
    const quantityMap = property.bookables && toObj(property.bookables
        .map(b => [
            b.id,
            { requested: getPropertyFieldValue(b.id) }
        ]));

    const totals = quantityMap && property.bookables && bookablesBill({
        bookables: property.bookables,
        requests: quantityMap,
        gatewayCharge,
        coupon
    });

    const formOrder = appState.order.getOrder(state, property.id);
    let order = isLoggedIn && appState.order.getOrder(state, property.id);
    if (!order) {
        order = formOrder;
    }
    const orderQuantityMap = (order && order.quantityMap) || {};

    const initialValForBookable = (b, selectedQuantity) => {
        const requested = (selectedQuantity || {}).requested;

        if (requested === undefined) {
            return b.availableInstances > 0 ? 1 : 0;
        }

        return requested;
    };

    // Only set initial values once. Otherwise redux-form won't pick the updated values.
    let formInitialValues = null;
    if (property.bookables) {
        formInitialValues = toObj(property.bookables
            .map(b => [
                `bookable-${b.id}`,
                initialValForBookable(b, orderQuantityMap[b.id])
            ]));
    }
    const isInProgress = appState.order.isInProgress(state);
    const waitingList = appState.event.getWaitingList(state);

    return {
        isInProgress,
        coupon,
        formInitialValues,
        isLoggedIn,
        isValidatingCoupon,
        order,
        propertyAvailability,
        totals,
        waitingList,
        email,
        gatewayCharge
    };
};

const mapDispatchToProps = dispatch => bindActionCreators({
    onSubmitBooking: () => dispatch(submit('booking-form')),
    submitBooking: appActions.order.requestClickEvent,
    fetchExistingLoveRequests: appActions.order.fetchExistingLoveRequests,
    joinWaitingList: appActions.event.joinWaitingList,
    fetchWaitingListStatus: appActions.event.fetchWaitingListStatus,
    showMessageModal: appActions.modals.showMessageModal,
    toggleLoginModalVisibility: appActions.login.toggleLoginModalVisibility
}, dispatch);

class EventBookingContainer extends React.Component {
    static propTypes = {
        isLoggedIn: PropTypes.bool,
        fetchExistingLoveRequests: PropTypes.func.isRequired,
        fetchWaitingListStatus: PropTypes.func.isRequired,
        property: eventPropertyType
    }

    componentWillMount() {
        this.fetchData(this.props);
    }

    fetchData({ property, isLoggedIn }) {
        if (!isLoggedIn) {
            return;
        }

        const id = idFromURLEnd(property.bookables[0].url);
        this.props.fetchExistingLoveRequests(property && property.id);
        this.props.fetchWaitingListStatus(id);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isLoggedIn && nextProps.isLoggedIn !== this.props.isLoggedIn) {
            this.fetchData(nextProps);
        }
    }

    render() {
        return (
            <RazorpayScriptLoader>
                <PaypalScriptLoader>
                    <EventBooking {...this.props} />
                </PaypalScriptLoader>
            </RazorpayScriptLoader>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EventBookingContainer);
