import { connect } from 'react-redux';
import React from 'react';

import { appState, appActions } from '../reducers';
import LoginModal from '../components/LoginModal/LoginModal.jsx';

const mapStateToProps = (state) => {
    const { login } = state;
    const isLoading = appState.session.isFetching(state);
    const userId = appState.session.userId(state);
    const user = appState.user.getUser(state, userId);
    const isLoggedIn = appState.session.hasSession(state);
    const loginFailed = appState.session.loginFailed(state);
    const loginErrorMessage = appState.session.loginErrorMessage(state);
    const displayForgotPasswordModal = appState.modals.showForgotPasswordModal(state);
    const loggedInFromFb = appState.session.loggedInFromFb(state);

    return {
        login,
        isLoading,
        loginModalVisibility: login.loginModalVisibility,
        user,
        isLoggedIn,
        loginFailed,
        loginErrorMessage,
        displayForgotPasswordModal,
        loggedInFromFb
    };
};

const LoginModalContainer = props =>
    <LoginModal {...props} loginModalVisibility />;

export default connect(mapStateToProps, {
    setSession: appActions.session.setSession,
    toggleLogin: appActions.login.toggleLoginModalVisibility,
    login: appActions.session.loginUser,
    logout: appActions.session.logoutUser,
    showMessageModal: appActions.modals.showMessageModal,
    showForgotPasswordModal: appActions.modals.showForgotPasswordModal,
    hideForgotPasswordModal: appActions.modals.hideForgotPasswordModal,
    resetPassword: appActions.session.resetPassword,
    setShouldRedirectAfterSignup: appActions.session.setShouldRedirectAfterSignup
})(LoginModalContainer);
