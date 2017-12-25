import { connect } from 'react-redux';

import { actions as appActions, getState as appState } from '../reducers';
import HostCreateOrderForm from '../components/HostCreateOrderForm/HostCreateOrderForm.jsx';

const mapStateToProps = (state) => {
    const isOrderCreating = appState.hostCreateOrder.isOrderCreating(state);
    const gatewayCharge = appState.appConfig.getServiceChargeRate(state);
    return { isOrderCreating, gatewayCharge };
};

export default connect(mapStateToProps, {
    hostCreateOrder: appActions.hostCreateOrder.createOrderByHost,
    resetCreateOrder: appActions.hostCreateOrder.resetHostCreateOrder,
    showMessageModal: appActions.modals.showMessageModal,
    updateProperty: appActions.property.updatePropertyDetails
})(HostCreateOrderForm);
