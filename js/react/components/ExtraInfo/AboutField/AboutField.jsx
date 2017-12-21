import React from 'react';
import { Field } from 'redux-form';

import { userPropType } from '../../../data-shapes/user.js';
import UserInfo from '../../UserInfo/UserInfo.jsx';

import InputField from '../../InputField/InputField.jsx';

import './AboutField.scss';

const AboutField = props => (
    <div className="AboutField__container">
        <h6>Your one liner</h6>
        <p>
            Startup&nbsp;founder, Coffee&nbsp;connoisseur,
            Travel&nbsp;Photographer…
        </p>
        { props.userData && <label htmlFor="about">{props.userData.name}</label>}
        <div className="AboutField__field__container">
            <Field
              type="text"
              id="about"
              placeholder="Few words about you"
              name="about"
              component={InputField}
            />
        </div>
    </div>
);

AboutField.propTypes = {
    userData: userPropType
};

export default AboutField;
