import { connect } from 'react-redux';

import { actions as appActions, getState as appState } from '../reducers';
import HostOrderCreateGuestForm from '../components/HostOrderCreateGuestForm/HostOrderCreateGuestForm.jsx';

const mapStateToProps = (state) => {
    const inputEmail = appState.hostCreateOrder.inputEmail(state);
    const isGuestCreating = appState.hostCreateOrder.isGuestCreating(state) || false;
    return { inputEmail, isGuestCreating };
};

export default connect(mapStateToProps, {
    createGuest: appActions.hostCreateOrder.createGuest,
    showMessageModal: appActions.modals.showMessageModal
})(HostOrderCreateGuestForm);
