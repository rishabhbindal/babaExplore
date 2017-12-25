import { Field, propTypes as formPropTypes, reduxForm } from 'redux-form';
import React from 'react';

import './SignupVerifyPhone.scss';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import InputField from '../InputField/InputField.jsx';

class SignupVerifyPhone extends React.Component {
    constructor(props) {
        super(props);
        this.resend = this.resend.bind(this);

        this.state = {};
    }

    resend() {
        const { resendCode, phone } = this.props;
        resendCode(phone).then(() => this.setState({ codeResent: true }));
    }

    render() {
        const { handleSubmit, nextPage, phone, step, submitting, prevFormEl } = this.props;

        return (
            <form onSubmit={handleSubmit}>
                <h6>Verify your mobile</h6>
                <p>
                    Check your mobile
                    {phone && <span>(<b>{phone}</b>)</span>}
                    for the 4 digit code we’ve sent you.
                </p>

                {step}

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
                {prevFormEl}

                <p className="signup-verify-phone__actions-links margin-vertical-1rem">
                    <a onClick={this.resend}>Resend code</a>
                    <a onClick={nextPage}>Skip verification</a>
                </p>
            </form>
        );
    }
}

SignupVerifyPhone.propTypes = {
    ...formPropTypes
};

export default reduxForm({
    form: 'signup-manual',
    destroyOnUnmount: false
})(SignupVerifyPhone);
