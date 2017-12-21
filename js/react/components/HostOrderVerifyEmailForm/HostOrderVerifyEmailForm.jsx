import React, { PropTypes } from 'react';
import { reduxForm } from 'redux-form';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import './HostOrderVerifyEmailForm.scss';

class HostOrderVerifyEmailForm extends React.Component {
    static propTypes = {
        fetchCheckRegistrationStatus: PropTypes.func.isRequired,
        checkRegistrationStatus: PropTypes.bool,
        checkRegistrationStatusLoading: PropTypes.bool,
        propertyId: PropTypes.number
    }

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.getStatusMessage = this.getStatusMessage.bind(this);
    }

    getStatusMessage() {
        if (!this.guestEmailInput) {
            return '';
        }
        const { value } = this.guestEmailInput;
        const { checkRegistrationStatus } = this.props;

        if (value && value.length > 0 && checkRegistrationStatus === true) {
            return 'Guest is registered with Explore Life Traveling, you can proceed to create order for Guest.';
        } else if (value && value.length > 0 && checkRegistrationStatus === false) {
            return 'Guest is not registered with Explore Life Traveling, please fill in details to create new account for the Guest.';
        }
        return '';
    }

    handleSubmit(event) {
        event.preventDefault();
        const { value } = this.guestEmailInput;
        const { propertyId } = this.props;
        if (value && value.length > 0) {
            this.props.fetchCheckRegistrationStatus(value, propertyId);
        }
    }

    render() {
        const { checkRegistrationStatusLoading } = this.props;

        return (
            <form onSubmit={this.handleSubmit} className="HostOrderVerifyEmailForm">
                <div className="HostOrderVerifyEmailForm-input medium-8 small-12 column">
                    <input
                      disabled={checkRegistrationStatusLoading}
                      type="text"
                      name="guestEmail"
                      placeholder="Guest Email"
                      autoComplete="off"
                      ref={input => this.guestEmailInput = input}
                    />
                </div>
                <div className="HostOrderVerifyEmailForm-button medium-4 show-for-medium">
                    <ButtonLoader
                      disabled={checkRegistrationStatusLoading}
                      type="submit"
                      size="large"
                      showSpinner={checkRegistrationStatusLoading}
                    >
                        Search
                    </ButtonLoader>
                </div>
                <div className="HostOrderVerifyEmailForm-button small-12 hide-for-medium">
                    <ButtonLoader
                      expanded
                      disabled={checkRegistrationStatusLoading}
                      type="submit"
                      size="large"
                      showSpinner={checkRegistrationStatusLoading}
                    >
                        Search
                    </ButtonLoader>
                </div>
                <div className="CheckRegistrationStatus-message"> { this.getStatusMessage() } </div>
                <div style={{ clear: 'both' }} />
            </form>
        );
    }
}

export default reduxForm({
    form: 'host-order-verify-email-form'
})(HostOrderVerifyEmailForm);
