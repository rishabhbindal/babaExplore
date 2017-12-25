import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import { actions, getState as appState } from '../reducers';
import { userPropType } from './../data-shapes/user.js';

import UserDashboard from './../components/UserDashboard/UserDashboard.jsx';

const mapStateToProps = (state) => {
    const userId = appState.session.userId(state);
    const user = appState.user.getUser(state, userId);
    const existingOrders = appState.order.getExistingLoveRequests(state);
    const existingOrderDeleting = appState.order.removeOrderStateLoading(state) || false;

    return { user, existingOrders, existingOrderDeleting };
};

class UserDashboardContainer extends React.Component {
    static propTypes = {
        user: userPropType,
        fetchExistingLoveRequests: PropTypes.func.isRequired,
        removeOrderState: PropTypes.func.isRequired,
        updateUserData: PropTypes.func.isRequired,
        showMessageModal: PropTypes.func.isRequired
    };

    componentDidMount() {
        this.props.fetchExistingLoveRequests({});
    }

    render() {
        const { user } = this.props;

        if (!user) {
            return null;
        }

        return (
            <UserDashboard
              {...this.props}
              removePendingOrder={this.props.removeOrderState}
            />
        );
    }
}

export default connect(mapStateToProps, {
    fetchExistingLoveRequests: actions.order.fetchExistingLoveRequests,
    removeOrderState: actions.order.removeOrderState,
    updateUserData: actions.user.updateUserData,
    showMessageModal: actions.modals.showMessageModal
})(UserDashboardContainer);
