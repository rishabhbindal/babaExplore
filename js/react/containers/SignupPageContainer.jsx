import { connect } from 'react-redux';
import { formValueSelector } from 'redux-form';
import React from 'react';

import { actions, getState } from '../reducers';
import { userPropType } from '../data-shapes/user.js';
import SignupPage from '../components/SignupPage/SignupPage.jsx';

// signup-manual should be a constant
const signupSelector = formValueSelector('signup-manual');
const mapStateToProps = (state) => {
    return {
        signupFormValues: {
            phone: signupSelector(state, 'phone'),
            email: signupSelector(state, 'email'),
            firstName: signupSelector(state, 'firstName'),
            lastName: signupSelector(state, 'lastName'),
            countryCode: signupSelector(state, 'countryCode')
        },
        isAlreadyVerified: getState.phone.isAlreadyVerified(state),
        loggedInFromFb: getState.session.loggedInFromFb(state),
        userData: getState.user.getUser(state, getState.session.userId(state)),
        userId: getState.session.userId(state)
    };
};

const SignupPageContainer = props => <SignupPage {...props} />;

SignupPageContainer.defaultProps = {
    userData: null
};

SignupPageContainer.propTypes = {
    userData: userPropType
};

export default connect(mapStateToProps, {
    sendCode: actions.phone.fetchRegisterAndSendCode,
    verifyCode: actions.phone.fetchRequestVerifyCode,
    registerUser: actions.user.registerUser,
    putUserData: actions.user.putUserData,
    showSignupSuccess: actions.modals.showSignupSuccess,
    showMessageModal: actions.modals.showMessageModal
})(SignupPageContainer);
