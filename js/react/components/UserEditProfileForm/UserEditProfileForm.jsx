import React, { PropTypes } from 'react';
import {
    Field,
    reduxForm
} from 'redux-form';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';

import {
    createValidator,
    emailValidation,
    placeValidation,
    phoneValidation
} from '../../lib/validations.js';
import HostInputField from './../HostInputField/HostInputField.jsx';
import ProfilePicField from '../ExtraInfo/ProfilePicField/ProfilePicField.jsx';
import DeactivateUserModal from '../DeactivateUser/DeactivateUser.jsx';

import idFromURLEnd from '../../lib/idFromURLEnd.js';
import { userPropType } from '../../data-shapes/user.js';
import messages from '../../constants/messages.js';

const userDesc = ({ input, meta: { touched, error } }) => (
    <div>
        <textarea {...input} rows="3" placeholder="Please introduce yourself" />
        {touched && error && <span>{error}</span>}
    </div>
);

class UserEditProfileForm extends React.Component {
    static propTypes = {
        showMessageModal: PropTypes.func.isRequired,
        handleSubmit: PropTypes.func.isRequired,
        updateUserData: PropTypes.func,
        initialize: PropTypes.func,
        isChanging: PropTypes.bool,
        user: userPropType
    }

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.confirmDeactivation = this.confirmDeactivation.bind(this);
    }

    async componentDidMount() {
        const { email, city, state, country, profilePic, phone, ownerPropertyIntro, dateOfBirth } = this.props.user;

        const { default: phoneNumber } = await import('../../lib/phoneNumber.js');

        const parsedNum = phoneNumber(phone);
        const obj = {};
        obj.email = email || '';
        obj.city = city || '';
        obj.state = state || '';
        obj.country = country || '';
        obj.profilePic = profilePic || '';
        obj.code = parsedNum.code;
        obj.phone = parsedNum.num;
        obj.about = ownerPropertyIntro;
        obj.day = dateOfBirth.day;
        obj.month = dateOfBirth.month;
        obj.year = dateOfBirth.year;
        this.props.initialize(obj);
    }

    handleClose() {
        this.props.closeForm();
    }

    handleSubmit(values) {
        const { showMessageModal } = this.props;
        if (!values) {
            return true;
        }
        const updatedData = { ...this.props.user, ...values };

        const closeForm = this.props.closeForm;

        return this.props.updateUserData(updatedData, idFromURLEnd(updatedData.url)).then(() => {
            showMessageModal(
                'Message',
                messages.USER_PROFILE_EDIT_SUCCESS
            );
            closeForm();
        }).catch((err) => {
            showMessageModal(
                'Message',
                messages.errors.USER_PROFILE_EDIT
            );
            throw Error(err);
        });
    }

    confirmDeactivation() {
        this.setState({ showDeactivateForm: true });
    }

    render() {
        const { handleSubmit, isChanging } = this.props;
        const { user } = this.props;
        const error = null;

        return (
            <form onSubmit={handleSubmit(this.handleSubmit)} className="medium-12 column">
                {
                    error &&
                    <div style={{ color: 'red', fontSize: '0.8rem', textAlign: 'center' }}>
                        {error}
                    </div>
                }

                <Field
                  type="text"
                  id="email"
                  name="email"
                  placeholder="Email"
                  autocomplete="off"
                  component={HostInputField}
                />
                <fieldset className="FieldSet" style={{ border: 'none', marginBottom: '1rem' }}>
                    <Field
                      type="text"
                      name="countryCode"
                      placeholder="+91"
                      component={HostInputField}
                      varient="countryCode"
                    />
                    <Field
                      type="text"
                      name="phone"
                      placeholder="Ten-digit mobile number"
                      component={HostInputField}
                    />
                </fieldset>
                <Field
                  type="text"
                  rows="3"
                  component={userDesc}
                  name="about"
                />
                <Field
                  type="text"
                  id="city"
                  name="city"
                  placeholder="City"
                  autocomplete="off"
                  component={HostInputField}
                />
                <Field
                  type="text"
                  id="state"
                  name="state"
                  placeholder="State"
                  autocomplete="off"
                  component={HostInputField}
                />
                <Field
                  type="text"
                  id="country"
                  name="country"
                  placeholder="Country"
                  autocomplete="off"
                  component={HostInputField}
                />
                <div className="text-align--center">
                <ButtonLoader
                  type="submit"
                  showSpinner={isChanging}
                >
                    Edit Profile
                </ButtonLoader>
                <div className="clearfix" />
                <button
                    type="button"
                    className="small hollow button"
                    onClick={this.handleClose}
                    style={{ marginTop: '1rem' }}
                >
                    Cancel
                </button>
                <div>
                    <button
                      type="button"
                      className="small hollow button"
                      style={{ margin: 0, marginBottom: '1rem' }}
                      onClick={this.confirmDeactivation}
                    >
                        Deactivate Profile
                    </button>
                </div>
                </div>
                <DeactivateUserModal
                  isOpen={this.state && this.state.showDeactivateForm}
                  closeModal={() => this.setState({ showDeactivateForm: false })}
                />
            </form>
        );
    }
}

export default reduxForm({
    form: 'user-edit-profile-form',
    fields: ['email', 'picutre', 'phone', 'about', 'city', 'state', 'country'],
    validate: createValidator({
        email: emailValidation,
        phone: phoneValidation,
        city: placeValidation,
        state: placeValidation,
        country: placeValidation
    })
})(UserEditProfileForm);
