import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import { withRouter } from 'react-router-dom';

import MessageModal from '../components/MessageModal/MessageModal.jsx';

import messages from '../constants/messages.js';
import { actions as appActions, getState as appState } from '../reducers';

const mapStateToProps = state => ({
    isOpen: appState.modals.getIsSignupSuccessOpen(state),
    shouldRedirectAfterSignup: appState.session.shouldRedirectAfterSignup(state)
});

class ModalSignupSuccessContainer extends React.Component {
    static defaultProps = {
        isOpen: false,
        shouldRedirectAfterSignup: false
    }

    static propTypes = {
        isOpen: PropTypes.bool,
        shouldRedirectAfterSignup: PropTypes.bool,
        hideSignupSuccess: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal() {
        const { history, shouldRedirectAfterSignup, hideSignupSuccess } = this.props;
        hideSignupSuccess();
        if (shouldRedirectAfterSignup) {
            history.goBack();
            return;
        }
        history.push('/');
    }

    render() {
        const { isOpen } = this.props;

        return (
            <MessageModal
              title={<h1>{messages.SIGNUP_SUCCESS_MESSAGE_TITLE}</h1>}
              closeModal={this.closeModal}
              isOpen={isOpen}
              message={messages.SIGNUP_SUCCESS_MESSAGE}
            />
        );
    }
}

export default withRouter(connect(mapStateToProps, {
    hideSignupSuccess: appActions.modals.hideSignupSuccess
})(ModalSignupSuccessContainer));
