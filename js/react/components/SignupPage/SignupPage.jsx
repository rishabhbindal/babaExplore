import React, { PropTypes } from 'react';

import './SignupPage.scss';

import analytics from '../../../lib/analytics.es6.js';

import FormPanel from '../FormPanel/FormPanel.jsx';
import SignupTopMessage from '../SignupTopMessage/SignupTopMessage.jsx';
import SocialSignup from '../SocialSignup/SocialSignup.jsx';
import SignupManual from '../SignupManual/SignupManual.jsx';

import FBLoginButtonContainer from '../../containers/FBLoginButtonContainer.jsx';
import MessageModalContainer from '../../containers/MessageModalContainer.jsx';
import ModalSingupSuccessContainer from '../../containers/ModalSingupSuccessContainer.jsx';

const SignupPage = ({
    signupFormValues, sendCode, verifyCode,
    registerUser, isAlreadyVerified, loggedInFromFb,
    userData, showSignupSuccess, putUserData, userId, showMessageModal
}) => {
    const trackShowSignupSuccess = (...args) => {
        analytics.fbpTrack('CompleteRegistration');
        return showSignupSuccess(...args);
    };

    return (
        <div>
            <MessageModalContainer />

            <ModalSingupSuccessContainer />

            <div className="row">
                <SignupTopMessage />
            </div>

            <div className="row">
                <div className="SignupPage__column">
                    { !loggedInFromFb &&
                      <FormPanel>
                          <FBLoginButtonContainer buttonText="Sign up with Facebook" />
                      </FormPanel>
                    }
                </div>
                <div className="SignupPage__column">
                    <FormPanel>
                        <SignupManual
                          signupFormValues={signupFormValues}
                          userData={userData}
                          userId={userId}
                          sendCode={sendCode}
                          verifyCode={verifyCode}
                          registerUser={registerUser}
                          putUserData={putUserData}
                          isAlreadyVerified={isAlreadyVerified}
                          loggedInFromFb={loggedInFromFb}
                          showSignupSuccess={trackShowSignupSuccess}
                          showMessageModal={showMessageModal}
                        />
                    </FormPanel>
                </div>
            </div>
        </div>
    );
};
SignupPage.propTypes = {
    registerUser: PropTypes.func,
    sendCode: PropTypes.func,
    signupFormValues: PropTypes.shape({
        email: PropTypes.string,
        name: PropTypes.string,
        phone: PropTypes.string
    }),
    verifyCode: PropTypes.func,
    isAlreadyVerified: PropTypes.bool
};

export default SignupPage;
