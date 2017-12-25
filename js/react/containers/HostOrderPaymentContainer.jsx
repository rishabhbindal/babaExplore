import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { getState as appState, actions } from '../reducers';
import { userPropType } from '../data-shapes/user.js';
import { hostOrderProptype } from '../data-shapes/HostOrder.js';
import { parseQuery } from '../lib/queryString.js';

import HostOrderPayment from '../components/HostOrderPayment/HostOrderPayment.jsx';
import RazorpayScriptLoader from '../components/RazorpayScriptLoader.jsx';
import PaypalScriptLoader from '../components/PaypalScriptLoader/PaypalScriptLoader.jsx';

const mapStateToProps = (state, { location }) => {

    const { ref, code } = parseQuery(location.search);
    const hostOrder = appState.hostOrder.getHostOrder(state);
    const user = hostOrder && appState.user.getUserByURL(state, hostOrder.owner);
    const host = hostOrder && appState.user.getUserByURL(state, hostOrder.property.owner);
    const updateSucceeded = hostOrder && appState.hostOrder.getHostOrderUpdateStatus(state);
    const orderFetchFailed = appState.hostOrder.getFetchFailureStatus(state);
    return { reff: ref, code, hostOrder, user, host, updateSucceeded, orderFetchFailed };
};

class HostOrderPaymentContainer extends React.Component {
    static propTypes = {
        reff: PropTypes.string,
        code: PropTypes.string,
        hostOrder: hostOrderProptype,
        updateSucceeded: PropTypes.bool,
        user: userPropType,
        host: userPropType,
        updateSucceeded: PropTypes.bool,
        orderFetchFailed: PropTypes.bool,
        fetchHostOrder: PropTypes.func,
        fetchUser: PropTypes.func,
        openPayment: PropTypes.func,
        showPaymentSelector: PropTypes.func.isRequired,
        selectDownPayment: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.fetchData = this.fetchData.bind(this);

        this.state = {};
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        const { reff, code } = this.props;
        const { fetchHostOrder, fetchUser } = this.props;
        return fetchHostOrder(reff, code).then(resp => Promise.all([
            fetchUser(resp.owner),
            fetchUser(resp.property.owner)
        ]));
    }

    render() {
        const { reff, code, hostOrder, user, host, updateSucceeded, orderFetchFailed } = this.props;
        const { openPayment, showPaymentSelector, selectDownPayment } = this.props;
        return (
            <RazorpayScriptLoader>
                <PaypalScriptLoader>
                    <HostOrderPayment
                      reff={reff}
                      code={code}
                      hostOrder={hostOrder}
                      user={user}
                      host={host}
                      openPayment={openPayment}
                      updateSucceeded={updateSucceeded}
                      orderFetchFailed={orderFetchFailed}
                      showPaymentSelector={showPaymentSelector}
                      selectDownPayment={selectDownPayment}
                    />
                </PaypalScriptLoader>
            </RazorpayScriptLoader>
        );
    }
}

export default connect(mapStateToProps, {
    fetchHostOrder: actions.hostOrder.fetchHostOrder,
    fetchUser: actions.user.fetchUser,
    openPayment: actions.hostOrder.openPayment,
    showPaymentSelector: actions.modals.showPaymentSelector,
    selectDownPayment: actions.hostOrder.selectDownPayment
})(HostOrderPaymentContainer);
