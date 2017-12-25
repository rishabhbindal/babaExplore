import React, { PropTypes } from 'react';
import { Field, propTypes as formPropTypes, reduxForm } from 'redux-form';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import InputField from '../InputField/InputField.jsx';

import {
    createValidator,
    nameValidation
} from '../../lib/validations.js';

const SignupFullName = (props) => {
    const { step, loggedInFromFb, prevFormEl } = props;
    const { handleSubmit, invalid, pristine, submitting } = props;

    return (
        <form onSubmit={handleSubmit}>
            <h6>Time for introductions</h6>
            {step}
            <fieldset className="FieldSet" style={{ borderColor: 'white' }}>
                <div>
                    <label htmlFor="firstName"> First Name </label>
                    <Field
                      autoFocus
                      type="text"
                      name="firstName"
                      component={InputField}
                      placeholder="First Name"
                    />
                </div>
                <div>
                    <label htmlFor="lastName"> Last Name </label>
                    <Field
                      type="text"
                      name="lastName"
                      component={InputField}
                      placeholder="Last Name"
                    />
                </div>
            </fieldset>
            <small>Must match your ID</small>

            <ButtonLoader
              disabled={(!loggedInFromFb && pristine) || invalid}
              expanded
              size="large"
              submitting={submitting}
              type="submit"
            >
                Continue
            </ButtonLoader>
            {prevFormEl}
        </form>
    );
};

SignupFullName.propTypes = {
    ...formPropTypes,
    step: PropTypes.node,
    loggedInFromFb: PropTypes.bool
};

export default reduxForm({
    form: 'signup-manual',
    destroyOnUnmount: false,
    validate: createValidator({
        firstName: nameValidation,
        lastName: nameValidation
    })
})(SignupFullName);
