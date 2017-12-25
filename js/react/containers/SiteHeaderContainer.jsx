import React, { PropTypes } from 'react';
import { withRouter } from 'react-router-dom';

import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

import { actions, getState } from '../reducers';
import { userPropType } from '../data-shapes/user.js';

import SiteHeader from '../components/SiteHeader/SiteHeader.jsx';

const mapStateToProps = (state) => {
    const { login } = state;
    const isLoading = getState.session.isFetching(state);
    const userId = getState.session.userId(state);
    const user = getState.user.getUser(state, userId);
    const isLoggedIn = getState.session.hasSession(state);
    const loginFailed = getState.session.loginFailed(state);
    const loginErrorMessage = getState.session.loginErrorMessage(state);
    const missingUserInfo = getState.session.missingUserInfo(state);
    const displayForgotPasswordModal = getState.modals.showForgotPasswordModal(state);
    const loggedInFromFb = getState.session.loggedInFromFb(state);

    return {
        login, isLoading, loginModalVisibility: login,
        user, isLoggedIn, loginFailed, loginErrorMessage, missingUserInfo, displayForgotPasswordModal, loggedInFromFb
    };
};

class SiteHeaderContainer extends React.Component {
    static propTypes = {
        isLoggedIn: PropTypes.bool.isRequired,
        user: userPropType,
        setSession: PropTypes.func,
        login: PropTypes.func,
        logout: PropTypes.func,
        showMessageModal: PropTypes.func,
        showForgotPasswordModal: PropTypes.func,
        hideForgotPasswordModal: PropTypes.func,
        setShouldRedirectAfterSignup: PropTypes.func.isRequired
    }

    static defaultProps = {
        user: null
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        this.props.setSession();
    }

    render() {

        return (
            <SiteHeader
              {...this.props}
              login={this.props.login}
              logout={this.props.logout}
              showMessageModal={this.props.showMessageModal}
              resetPassword={this.props.resetPassword}
            />);
    }
}

export default withRouter(connect(mapStateToProps, {
    setSession: actions.session.setSession,
    toggleLogin: actions.login.toggleLoginModalVisibility,
    login: actions.session.loginUser,
    logout: actions.session.logoutUser,
    showMessageModal: actions.modals.showMessageModal,
    showForgotPasswordModal: actions.modals.showForgotPasswordModal,
    hideForgotPasswordModal: actions.modals.hideForgotPasswordModal,
    resetPassword: actions.session.resetPassword,
    setShouldRedirectAfterSignup: actions.session.setShouldRedirectAfterSignup
})(SiteHeaderContainer));
