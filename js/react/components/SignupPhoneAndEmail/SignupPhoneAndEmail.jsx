import { Field, propTypes as formPropTypes, reduxForm } from 'redux-form';
import React, { PropTypes } from 'react';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import InputField from '../InputField/InputField.jsx';

import {
    createValidator,
    phoneValidation,
    emailValidation
} from '../../lib/validations.js';

const SignupPhoneAndEmail = (props) => {
    const { handleSubmit, submitting, loggedInFromFb } = props;
    const { step } = props;

    const header = loggedInFromFb ?
        (<div>
            <h6>Craft your profile</h6>
            <p> Edit your profile and fill in missing details.
                We’ll need to begin by verifying a contact method.</p>
        </div>) :
        (<div>
            <h6>Create your profile manually.</h6>
            <p>Start from scratch and craft your profile. We’ll need to begin by verifying a contact method.</p>
        </div>);

    return (
        <form onSubmit={handleSubmit}>
            {header}

            {step}
            <fieldset className="FieldSet" style={{ border: 'none', marginBottom: '1rem' }}>
                <Field
                  type="text"
                  name="countryCode"
                  placeholder="+91"
                  component={InputField}
                  varient="countryCode"
                />
                <Field
                  type="text"
                  name="phone"
                  placeholder="Ten-digit mobile number"
                  component={InputField}
                  autoFocus
                />
            </fieldset>
            <Field
              type="email"
              name="email"
              placeholder="Email Address"
              component={InputField}
            />

            <ButtonLoader
              expanded
              type="submit"
              size="large"
              showSpinner={submitting}
            >
                Get verification code
            </ButtonLoader>
        </form>
    );
};
SignupPhoneAndEmail.propTypes = {
    step: PropTypes.node,
    loggedInFromFb: PropTypes.bool,
    ...formPropTypes
};

export default reduxForm({
    form: 'signup-manual',
    destroyOnUnmount: false,
    validate: createValidator({
        phone: phoneValidation,
        email: emailValidation
    })
})(SignupPhoneAndEmail);
