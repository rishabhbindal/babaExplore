import { Field, propTypes as formPropTypes, reduxForm } from 'redux-form';
import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import InputField from '../InputField/InputField.jsx';

import { createValidator, termsValidation } from '../../lib/validations.js';

const FbSignupLastStep = (props) => {
    const { handleSubmit, step, prevFormEl } = props;
    const { error, submitting, pristine } = props;

    const tocLabel = (
        <span> I accept the
            <Link to="https://www.explorelifetraveling.com/terms">
                &nbsp;terms &amp; conditions
            </Link>
        </span>
    );

    return (
        <form onSubmit={handleSubmit}>
            <h6>Terms &amp; Conditions</h6>
            <p>Congratulations. You have set up your profile!!</p>
            {step}

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
FbSignupLastStep.propTypes = {
    step: PropTypes.node,
    ...formPropTypes
};

export default reduxForm({
    form: 'signup-manual',
    destroyOnUnmount: false,
    validate: createValidator({ terms: termsValidation })
})(FbSignupLastStep);
