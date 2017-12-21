import React, { PropTypes } from 'react';
import {
    Field,
    reduxForm
} from 'redux-form';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';

import { createValidator, passwordValidation, nameValidation } from '../../lib/validations.js';
import HostInputField from './../HostInputField/HostInputField.jsx';

class UserChangePasswordForm extends React.Component {
    static propTypes = {
        reset: PropTypes.func.isRequired,
        onSuccess: PropTypes.func,
        showMessageModal: PropTypes.func.isRequired,
        userChangePassword: PropTypes.func.isRequired,
        handleSubmit: PropTypes.func.isRequired,
        isChanging: PropTypes.bool
    }

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleFailure = this.handleFailure.bind(this);
        this.handleSuccess = this.handleSuccess.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = { error: null };
    }

    handleFailure(attributes) {
        let error = '';
        Object.keys(attributes).map((key) => {
            if (key === 'old_password') {
                error += 'Old Password: ' + attributes[key].join(', ');
            }
            return true;
        });
        return this.setState({ error });
    }

    handleSuccess() {
        this.setState({ error: null });
        this.props.reset();
        this.props.showMessageModal('Success', 'Password Changed Successfully.');
        this.props.closeForm();
    }

    handleClose() {
        this.props.closeForm();
    }

    handleSubmit(attributes) {
        if (!attributes) {
            return true;
        }
        const { oldPassword, password, confirmPassword } = attributes;
        const params = {
            old_password: oldPassword,
            new_password1: password,
            new_password2: confirmPassword
        };
        this.props.userChangePassword(params)
            .then(this.handleSuccess)
            .catch(this.handleFailure);
        return true;
    }

    render() {
        const { handleSubmit, isChanging } = this.props;
        const { error } = this.state;

        return (
            <form onSubmit={handleSubmit(this.handleSubmit)} className="medium-12 column">
                {
                    error &&
                    <div style={{ color: 'red', fontSize: '0.8rem', textAlign: 'center' }}>
                        {error}
                    </div>
                }

                <Field
                  type="password"
                  id="oldPassword"
                  name="oldPassword"
                  placeholder="Old Password"
                  autocomplete="off"
                  component={HostInputField}
                />
                <Field
                  type="password"
                  id="password"
                  name="password"
                  placeholder="New Password"
                  autocomplete="off"
                  component={HostInputField}
                />
                <Field
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  autocomplete="off"
                  component={HostInputField}
                />
                <div className="text-align--center">
                    <ButtonLoader
                      type="submit"
                      showSpinner={isChanging}
                    >
                        Change Password
                    </ButtonLoader>
                    <div className="clearfix" />
                    <button
                      className="small hollow button"
                      type="button"
                      onClick={this.handleClose}
                      style={{ marginTop: '1rem' }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        );
    }
}

export default reduxForm({
    form: 'user-change-password-form',
    fields: ['password', 'confirmPassword', 'oldPassword'],
    validate: createValidator({
        oldPassword: nameValidation,
        password: nameValidation,
        confirmPassword: nameValidation,
        confirmPassword: passwordValidation
    })
})(UserChangePasswordForm);
