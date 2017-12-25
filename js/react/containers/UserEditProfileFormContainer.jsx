import { connect } from 'react-redux';

import { actions as appActions, getState as appState } from '../reducers';
import UserEditProfileForm from '../components/UserEditProfileForm/UserEditProfileForm.jsx';

const mapStateToProps = (state) => {
    const userId = appState.session.userId(state);
    const user = appState.user.getUser(state, userId);

    return { user };
};

export default connect(mapStateToProps, {
    updateUserData: appActions.user.updateUserData,
    showMessageModal: appActions.modals.showMessageModal
})(UserEditProfileForm);
