import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { actions, getState as appState } from '../reducers';
import { eventPropertyType } from '../data-shapes/property.js';
import { userPropType } from '../data-shapes/user.js';
import HostBookingDetails from '../components/HostBookingDetails/HostBookingDetails.jsx';

const mapStateToProps = (state, { ownerUrl }) => {
    const owner = appState.user.getUserByURL(state, ownerUrl);
    const order = appState.hostProperties.getOrder(state);
    return { owner, order };
};

class HostBookingDetailsContainer extends React.Component {

    static propTypes = {
        fetchHostPropertyOwner: PropTypes.func.isRequired,
        property: eventPropertyType,
        ownerUrl: PropTypes.string,
        orderUrl: PropTypes.string,
        order: PropTypes.object,
        owner: userPropType
    }

    componentWillMount(nextProps) {
        const { owner, ownerUrl, orderUrl } = this.props;
        this.props.fetchHostPropertyOwner(ownerUrl);
        this.props.fetchHostOrder(orderUrl);
    }


    render() {
        const { owner, order } = this.props;
        return (
            <HostBookingDetails
              owner={owner}
              order={order}
            />
        );
    }
}

export default connect(
    mapStateToProps, {
        fetchHostPropertyOwner: actions.user.fetchUser,
        fetchHostOrder: actions.hostProperties.fetchOrder,
    }
)(HostBookingDetailsContainer);
