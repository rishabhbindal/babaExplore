import { connect } from 'react-redux';

import { actions as appActions, getState as appState } from '../reducers';
import HostOrderVerifyEmailForm from '../components/HostOrderVerifyEmailForm/HostOrderVerifyEmailForm.jsx';

const mapStateToProps = (state) => {
    const checkRegistrationStatus = appState.hostCreateOrder.checkRegistrationStatus(state);
    const checkRegistrationStatusLoading = appState.hostCreateOrder.checkRegistrationStatusLoading(state);
    return { checkRegistrationStatus, checkRegistrationStatusLoading };
};

export default connect(mapStateToProps, {
    fetchCheckRegistrationStatus: appActions.hostCreateOrder.checkRegistrationStatus
})(HostOrderVerifyEmailForm);
