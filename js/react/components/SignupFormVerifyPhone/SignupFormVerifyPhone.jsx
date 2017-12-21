import React, { PropTypes } from 'react';
import { Field, propTypes as formPropTypes, reduxForm } from 'redux-form';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import InputField from '../InputField/InputField.jsx';
import Loader from '../Loader/Loader.jsx';

class SignupFormVerifyPhone extends React.Component {
    static defaultProps = {
        isAlreadyVerified: false,
        loggedInFromFb: false,
        shouldRedirectAfterSignup: false
    }

    static propTypes = {
        ...formPropTypes,
        isAlreadyVerified: PropTypes.bool,
        loggedInFromFb: PropTypes.bool,
        shouldRedirectAfterSignup: PropTypes.bool,
        sendVerCode: PropTypes.func.isRequired,
        showSignupSuccess: PropTypes.func.isRequired,
        resendCode: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);

        this.resend = this.resend.bind(this);
        this.showMsgOrRedirect = this.showMsgOrRedirect.bind(this);

        this.state = { showLoader: true };
    }

    componentDidMount() {
        const { phone } = this.props;
        const { sendVerCode } = this.props;

        if (phone) {
            sendVerCode(phone).then(() => this.setState({ showLoader: false }));
        }
    }

    componentWillReceiveProps(nextProps) {
        const { isAlreadyVerified } = nextProps;
        if (this.props.isAlreadyVerified !== isAlreadyVerified) {
            this.showMsgOrRedirect();
        }
    }

    resend() {
        const { resendCode, phone } = this.props;
        resendCode(phone).then(() => this.setState({ codeResent: true }));
    }

    showMsgOrRedirect() {
        const { loggedInFromFb, showSignupSuccess, shouldRedirectAfterSignup, history } = this.props;
        if (loggedInFromFb) {
            if (shouldRedirectAfterSignup) {
                history.goBack();
                return;
            }
            history.push('/');
        }
        showSignupSuccess();
    }

    render() {
        const { handleSubmit, submitting } = this.props;
        const { phone } = this.props;

        const loader = (
            <div>
                <div style={{ textAlign: 'center' }}><Loader /></div>
                <p style={{ fontWeight: '600' }}>
                    Checking whether your phone is verified with ExploreLifeTraveling...
                </p>
            </div>
        );

        const verifyPhoneForm = (
            <form onSubmit={handleSubmit}>
                <h6>You have signed up Successfully!!</h6>
                <p>
                    Your phone does not seem to be verified with Explore Life Traveling
                    You should have received your verification code as a sms on your mobile.
                    {phone && <span><b>{phone}</b></span>}
                    Please enter the code from the sms to verify your number.
                </p>
                <Field
                  autoFocus
                  type="tel"
                  maxLength={4}
                  name="verificationCode"
                  component={InputField}
                />

                { this.state.codeResent && <p>Verification code has been sent again</p> }
                <ButtonLoader
                  expanded
                  type="submit"
                  size="large"
                  showSpinner={submitting}
                >
                    Verify
                </ButtonLoader>
                <p style={{ textAlign: 'left' }}>
                    <a onClick={this.resend} className="SignupVerifyPhone__links">Resend Code</a>
                    <a onClick={this.showMsgOrRedirect} className="SignupVerifyPhone__links">Skip Verification</a>
                </p>
            </form>
        );

        return this.state.showLoader ? loader : verifyPhoneForm;
    }
}

export default reduxForm({
    form: 'phone-verification',
    destroyOnUnmount: false
})(SignupFormVerifyPhone);

