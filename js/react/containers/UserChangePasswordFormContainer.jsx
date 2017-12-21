import { connect } from 'react-redux';

import { actions as appActions, getState as appState } from '../reducers';
import UserChangePasswordForm from '../components/UserChangePasswordForm/UserChangePasswordForm.jsx';

const mapStateToProps = (state) => {
    const isChanging = appState.user.isPasswordChanging(state);
    return { isChanging };
};

export default connect(mapStateToProps, {
    userChangePassword: appActions.user.userChangePassword,
    showMessageModal: appActions.modals.showMessageModal
})(UserChangePasswordForm);
