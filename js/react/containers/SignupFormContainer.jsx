import { connect } from 'react-redux';
import { formValueSelector, SubmissionError } from 'redux-form';
import React, { PropTypes } from 'react';
import moment from 'moment';

import { actions, getState } from '../reducers';
import { userPropType } from '../data-shapes/user.js';
// import SignupPage from '../components/SignupPage/SignupPage.jsx';
import SignupForm from '../components/SignupForm/SignupForm.jsx';

import analytics from '../../lib/analytics.es6.js';

// signup-form should be a constant
const signupSelector = formValueSelector('signup-form');
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
        userId: getState.session.userId(state),
        shouldRedirectAfterSignup: getState.session.shouldRedirectAfterSignup(state),
        loggingFromFb: getState.session.isLoggingWithFb(state)
    };
};

class SignupFormContainer extends React.Component {
    constructor(props) {
        super(props);

        this.state = { parsedNumber: {} };
    }

    componentWillReceiveProps(nextProps) {
        this.parsedNumber(nextProps.userData && nextProps.userData.phone);
    }

    componentWillUnmount() {
        const { setShouldRedirectAfterSignup } = this.props;
        setShouldRedirectAfterSignup(false);
    }

    async parsedNumber(number) {
        if (!number) {
            return;
        }

        const { default: phoneNumber } = await import('./../lib/phoneNumber.js');

        this.setState({
            parsedNumber: phoneNumber(number)
        });
    }

    render() {
        const { putUserData, registerUser, showSignupSuccess, verifyCode, sendCode, loginUser, setSession, toggleLoginModal } = this.props;
        const { userData, userId, loggedInFromFb, isAlreadyVerified, history } = this.props;
        const parsedNum = this.state.parsedNumber;

        const age = userData && moment().diff(moment(userData.dateOfBirth.year, 'YYYY'), 'years');
        // we are not going to get the phone number in the initial values as we dont wait for parsedNumber to work
        const initialValues = userData && {
            email: userData.email && userData.email.search('@example.com') < 0 ?
                   userData.email : '',
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: parsedNum.num || '',
            countryCode: parsedNum.code || '',
            /* dob */
            day: userData.dateOfBirth.day,
            month: userData.dateOfBirth.month,
            year: userData.dateOfBirth.year,

            gender: userData.gender.toLowerCase(),
            age
        };

        const errorMessage = (es) =>
            (es && Array.isArray(es) && es.map(a => a.trim()).join(', ')) ||
            (es && typeof es === 'object' && !es.details &&
                Object.keys(es).map(k => `${k}: ${es[k]}`).join(', ')) ||
            (es && typeof es === 'object' && es.details &&
                Object.keys(es.details).map(k => `'${k}': ${es.details[k]}`).join(', ')) ||
            'Error in Sign up';

        const submitMethod = loggedInFromFb ? putUserData : registerUser;
        const onSubmit = data => submitMethod(data, userId)
            .then(() => {
                analytics.fbpTrack('CompleteRegistration');
                analytics.event({
                    eventCategory: 'Registeration',
                    eventAction: 'Signup Completed'
                });
                if (!loggedInFromFb) {
                    loginUser({ username: data.email, password: data.password })
                    .then(() => { setSession(); });
                }
                toggleLoginModal(false);
                this.setState({ submitSuccess: true });
            }).catch((e) => {
                throw new SubmissionError({
                    _error: errorMessage(e)
                });
            });

        const missingInfo = userData && !(userData.phone && userData.dateOfBirth.year);

        return (
            <SignupForm
              {...this.props}
              initialValues={initialValues}
              onSubmit={onSubmit}
              errorMessage={errorMessage}
              submitSuccess={this.state.submitSuccess}
              missingInfo={missingInfo}
            />
        );
    }
}

SignupFormContainer.defaultProps = {
    userData: null
};

SignupFormContainer.propTypes = {
    userData: userPropType,
    toggleLoginModal: PropTypes.func.isRequired
};

export default connect(mapStateToProps, {
    sendCode: actions.phone.fetchRegisterAndSendCode,
    verifyCode: actions.phone.fetchRequestVerifyCode,
    registerUser: actions.user.registerUser,
    putUserData: actions.user.putUserData,
    showSignupSuccess: actions.modals.showSignupSuccess,
    showMessageModal: actions.modals.showMessageModal,
    setShouldRedirectAfterSignup: actions.session.setShouldRedirectAfterSignup,
    loginUser: actions.session.loginUser,
    setSession: actions.session.setSession,
    toggleLoginModal: actions.login.toggleLoginModalVisibility
})(SignupFormContainer);
