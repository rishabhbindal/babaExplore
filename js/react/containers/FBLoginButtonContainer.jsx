import { connect } from 'react-redux';
import React from 'react';

import { actions, getState } from '../reducers';
import FBLoginButton from '../components/FBLoginButton/FBLoginButton.jsx';

const mapStateToProps = (state) => {
    return {
        isLoggingWithFb: getState.session.isLoggingWithFb(state)
    };
};

const FBLoginButtonContainer = props => <FBLoginButton {...props} />;

export default connect(mapStateToProps, {
    setSession: actions.session.setSession,
    toggleLogin: actions.login.toggleLoginModalVisibility,
    toggleLoggingWithFb: actions.session.toggleLoggingWithFb,
    fbLogin: actions.session.fbLoginUser,
})(FBLoginButtonContainer);
