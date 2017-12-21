import React, { PropTypes } from 'react';
import cls from 'classnames';
import { Field, Fields, propTypes as formPropTypes, reduxForm } from 'redux-form';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import InputField from '../InputField/InputField.jsx';

import {
    createValidator,
    dayValidation,
    genderValidation,
    monthValidation,
    yearValidation
} from '../../lib/validations.js';

export const dobFields = (fields) => {
    const getFormState = (field, attr) => fields[field].meta[attr];
    const touched = getFormState('day', 'touched') || getFormState('month', 'touched') || getFormState('year', 'touched');
    const error = getFormState('day', 'error') || getFormState('month', 'error') || getFormState('year', 'error');
    const errorMessageCls = cls('Signup__error-message', {
        'Signup__error-message--active': error
    });

    return (
        <div>
            <label htmlFor="day">Date of Birth</label>
            <fieldset className="FieldSet">
                <Field
                  {...fields.day}
                  type="tel"
                  maxLength={2}
                  name="day"
                  placeholder="DD"
                  component={InputField}
                  hideError
                  varient="smallDOB"
                />
                <span className="DateSeparator">/</span>
                <Field
                  type="tel"
                  {...fields.month}
                  maxLength={2}
                  name="month"
                  placeholder="MM"
                  component={InputField}
                  hideError
                  varient="smallDOB"
                />
                <span className="DateSeparator">/</span>
                <Field
                  type="tel"
                  {...fields.year}
                  maxLength={4}
                  name="year"
                  placeholder="YYYY"
                  component={InputField}
                  hideError
                  varient="smallDOB"
                />
            </fieldset>
            { touched && <span className={errorMessageCls}>
                { error }
            </span> }
        </div>
    );
};

const SignupDOB = (props) => {
    const { step, loggedInFromFb, prevFormEl } = props;
    const { handleSubmit, submitting, pristine, invalid } = props;

    return (
        <form onSubmit={handleSubmit}>
            <h6>Bio information</h6>
            {step}

            <Fields names={['day', 'month', 'year']} component={dobFields} />

            <div className="input-set margin-vertical-1rem">
                <label htmlFor="gender">Gender</label>

                <Field
                  label="Male"
                  type="radio"
                  name="gender"
                  value="male"
                  id="gender_male"
                  component={InputField}
                />

                <Field
                  label="Female"
                  type="radio"
                  name="gender"
                  value="female"
                  id="gender_female"
                  component={InputField}
                />
            </div>

            <ButtonLoader
              type="submit"
              expanded
              size="large"
              showSpinner={submitting}
              disabled={(!loggedInFromFb && pristine) || invalid}
            >
                Continue
            </ButtonLoader>
            {prevFormEl}
        </form>
    );
};

SignupDOB.propTypes = {
    step: PropTypes.node,
    loggedInFromFb: PropTypes.bool,
    ...formPropTypes
};

export default reduxForm({
    form: 'signup-manual',
    destroyOnUnmount: false,
    validate: createValidator({
        day: dayValidation,
        month: monthValidation,
        year: yearValidation,
        gender: genderValidation
    })
})(SignupDOB);
