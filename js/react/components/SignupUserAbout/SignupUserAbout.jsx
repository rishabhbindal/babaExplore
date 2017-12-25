import { Field, propTypes as formPropTypes, reduxForm } from 'redux-form';
import React, { PropTypes } from 'react';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import InputField from '../InputField/InputField.jsx';
import UserInfo from '../UserInfo/UserInfo.jsx';

const SingupUserAbout = (props) => {
    const { handleSubmit, step, name, prevFormEl } = props;
    const { submitting, pristine, invalid } = props;

    return (
        <form onSubmit={handleSubmit}>
            <h6>Your one liner</h6>
            <p>
                Give us a quick introduction to who you are:
                Startup&nbsp;founder, Coffee&nbsp;connoisseur,
                Travel&nbsp;Photographer…
            </p>
            {step}
            <div className="row one-two-grid">
                <UserInfo
                  img="images/user.jpg"
                  key="Carol Rajneesh"
                  name="Carol Rajneesh"
                  quote="I live for mountains"
                />
                <UserInfo
                  img="images/user.jpg"
                  key="Carol Rajneesh1"
                  name="Carol Rajneesh"
                  quote="I live for mountains"
                />
            </div>
            <label htmlFor="about">{name}</label>
            <Field
              autoFocus
              type="text"
              id="about"
              name="about"
              placeholder="Spy and espionage movie watcher"
              component={InputField}
            />

            <ButtonLoader
              type="submit"
              expanded
              size="large"
              showSpinner={submitting}
              disabled={pristine || invalid}
            >
                Continue
            </ButtonLoader>
            {prevFormEl}
        </form>
    );
};
SingupUserAbout.propTypes = {
    step: PropTypes.node,
    ...formPropTypes
};


export default reduxForm({
    form: 'signup-manual',
    destroyOnUnmount: false
})(SingupUserAbout);
