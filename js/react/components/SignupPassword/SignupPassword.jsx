import { Field, propTypes as formPropTypes, reduxForm } from 'redux-form';
import React, { PropTypes } from 'react';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import InputField from '../InputField/InputField.jsx';

import { createValidator, passwordValidation, termsValidation } from '../../lib/validations.js';

const SignupPassword = (props) => {
    const { handleSubmit, step, prevFormEl } = props;
    const { error, submitting, pristine } = props;

    const tocLabel = (
        <span> I accept the
            <a
              href="https://www.explorelifetraveling.com/terms"
              rel="noopener noreferrer"
              target="_blank"
            >
                &nbsp;terms &amp; conditions
            </a>
        </span>
    );

    return (
        <form onSubmit={handleSubmit}>
            <h6>Security</h6>
            <p>Set your password</p>
            {step}
            <Field
              autoFocus
              type="password"
              id="password"
              name="password"
              placeholder="Password"
              component={InputField}
            />
            <Field
              type="password"
              id="cpassword"
              name="cpassword"
              placeholder="Confirm Password"
              component={InputField}
            />

            <Field
              type="checkbox"
              name="terms"
              label={tocLabel}
              labelAfter
              id="terms"
              component={InputField}
            />

            {error && <div><strong>{error}</strong></div>}

            <ButtonLoader
              type="submit"
              expanded
              size="large"
              showSpinner={submitting}
              disabled={pristine}
            >
                Final Step
            </ButtonLoader>
            {prevFormEl}
        </form>
    );
};
SignupPassword.propTypes = {
    step: PropTypes.node,
    ...formPropTypes
};

export default reduxForm({
    form: 'signup-manual',
    destroyOnUnmount: false,
    validate: createValidator({ cpassword: passwordValidation, terms: termsValidation })
})(SignupPassword);
