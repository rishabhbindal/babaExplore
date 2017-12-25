import React, { PropTypes } from 'react';
import { reduxForm, Field } from 'redux-form';
import DatePicker from 'react-datepicker';
import moment from 'moment';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import HostInputField from '../HostInputField/HostInputField.jsx';

import {
    createValidator,
    phoneValidation,
    confirmEmailValidation,
    passwordValidation,
    nameValidation,
    genderValidation
} from '../../lib/validations.js';
import countryCodePrefix from '../../lib/countryCodePrefix.js';

class HostOrderCreateGuestForm extends React.Component {
    static propTypes = {
        handleSubmit: PropTypes.func.isRequired,
        invalid: PropTypes.bool.isRequired,
        inputEmail: PropTypes.string,
        propertyId: PropTypes.number.isRequired,
        showMessageModal: PropTypes.func.isRequired,
        createGuest: PropTypes.func.isRequired,
        isGuestCreating: PropTypes.bool
    }

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            dob: moment().subtract('years', 18)
        };
    }

    handleSubmit(attributes) {
        const { firstName, lastName, confirmEmail, password, phoneNumber, countryCode, gender } = attributes;
        const { dob } = this.state;
        const { showMessageModal, propertyId, inputEmail } = this.props;
        const prefix = countryCodePrefix(countryCode);

        if (inputEmail !== confirmEmail) {
            showMessageModal('Message', 'Guest Email and confirmation Guest Email do not match.');
            return Promise.resolve();
        }
        const params = {
            password,
            first_name: firstName,
            last_name: lastName,
            email: confirmEmail,
            date_of_birth: dob.format('YYYY-MM-DD'),
            details: {
                gender,
                city: '',
                state: '',
                country: '',
                street_address: '',
                terms_accepted: false,
                phone_number: ((`${prefix}${countryCode || ''}` || '+91') + phoneNumber)
            }
        };
        this.props.createGuest(params, propertyId);
        return true;
    }

    dobChange = (value) => {
        this.setState({ dob: value });
    }

    render() {
        const { handleSubmit, isGuestCreating, invalid, dirty } = this.props;

        return (
            <form onSubmit={handleSubmit(this.handleSubmit)} className="HostOrderCreateGuestForm">
                <div className="medium-6 column" style={{ padding: '0 .25rem 0 0' }}>
                    <Field
                      name="firstName"
                      type="text"
                      label="First Name"
                      placeholder="First Name"
                      component={HostInputField}
                    />
                </div>
                <div className="medium-6 column nopadding-right" style={{ padding: '0 0 0 .25rem' }}>
                    <Field
                      name="lastName"
                      type="text"
                      label="Last Name"
                      placeholder="Last Name"
                      component={HostInputField}
                    />
                </div>
                <div style={{ clear: 'both' }} />
                <Field
                  name="confirmEmail"
                  type="text"
                  label="Re-enter Email"
                  placeholder="Re-enter Email"
                  component={HostInputField}
                />
                <Field
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="Password"
                  component={HostInputField}
                />
                <Field
                  name="confirmPassword"
                  type="password"
                  label="Re-enter Password"
                  placeholder="Re-enter Password"
                  component={HostInputField}
                />
                <div className="medium-6 column" style={{ padding: '0 .25rem 0 0' }}>
                    <label htmlFor="Date of Birth">Date of Birth</label>
                    <DatePicker
                      selected={moment(this.state.dob, 'YYYY-MM-DD')}
                      onChange={this.dobChange}
                      maxDate={moment().subtract('year', 18)}
                      peekNextMonth
                      showMonthDropdown
                      showYearDropdown
                    />
                </div>
                <div className="medium-6 column" style={{ padding: '0 0 0 .25rem', float: 'right' }}>
                    <label htmlFor="Gender">Gender</label>
                    <Field component="select" name="gender">
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                    </Field>
                </div>
                <div className="medium-3 column" style={{ padding: '0 .25rem 0 0' }}>
                    <Field
                      name="countryCode"
                      type="text"
                      label="Code"
                      placeholder="Code"
                      component={HostInputField}
                    />
                </div>
                <div className="medium-9 column" style={{ padding: '0 0 0 .25rem', float: 'right' }}>
                    <Field
                      name="phoneNumber"
                      type="text"
                      label="Phone Number"
                      placeholder="Phone Number"
                      varient="plain"
                      component={HostInputField}
                    />
                </div>
                { dirty && invalid && <p className="cb">Please fill in all user details</p> }
                <ButtonLoader
                  expanded
                  size="large"
                  disabled={invalid}
                  showSpinner={isGuestCreating}
                >
                    Create Guest
                </ButtonLoader>
                <br />
                <div style={{ clear: 'both' }} />
            </form>
        );
    }
}

export default reduxForm({
    form: 'host-order-create-guest-form',
    fields: ['firstName', 'lastName', 'phoneNumber', 'confirmEmail', 'coutryCode', 'confirmPassword'],
    validate: createValidator({
        firstName: nameValidation,
        lastName: nameValidation,
        phoneNumber: phoneValidation,
        confirmEmail: confirmEmailValidation,
        confirmPassword: passwordValidation,
        gender: genderValidation
    })
})(HostOrderCreateGuestForm);
