import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { actions as appActions, getState as appState } from '../../reducers';

import MessageModal from '../MessageModal/MessageModal.jsx';
import Button from '../Button/Button.jsx';

const mapStateToProps = state => ({
    id: appState.session.userId(state)
});

const errorMessage = es =>
    (es && Array.isArray(es) && es.map(a => a.trim()).join(', ')) ||
    (es && typeof es === 'object' && !es.details &&
        Object.keys(es).map(k => `${k}: ${es[k]}`).join(', ')) ||
    (es && typeof es === 'object' && es.details &&
        Object.keys(es.details).map(k => `'${k}': ${es.details[k]}`).join(', ')) ||
    'Trying to deactivate user account failed';

class DeactivateUserModal extends React.Component {
    static defaultProps = {
        isOpen: false,
        id: null
    }

    static propTypes = {
        isOpen: PropTypes.bool,
        id: PropTypes.string,
        closeModal: PropTypes.func.isRequired,
        deactivateUser: PropTypes.func.isRequired,
        logout: PropTypes.func.isRequired,
        showMessageModal: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.onCancel = this.onCancel.bind(this);
        this.onOk = this.onOk.bind(this);
        this.onSuccess = this.onSuccess.bind(this);

        this.state = {};
    }

    onCancel() {
        this.props.closeModal();
    }

    onOk() {
        const { id, deactivateUser, showMessageModal } = this.props;
        deactivateUser(id).catch((err) => {
            const { detail } = err;
            if (detail && detail.toLowerCase() === 'not found.') {
                this.setState({ success: true });
                return;
            }
            showMessageModal(
                'Error',
                errorMessage(err)
            );
            this.onCancel();
        });
    }

    onSuccess() {
        const { history, logout } = this.props;
        logout();
        history.push({
            pathname: '/'
        });
    }

    render() {
        const { isOpen } = this.props;

        const wholeBody = (
            <div>
                <p className="f4">
                    Once an account is deactivated you need to contact support@explorelifetraveling.com and provide them your registered email id to reactivate your account. Are you sure you want to deactivate your account?
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={this.onCancel} type="button">
                        Cancel
                    </Button>

                    <Button onClick={this.onOk} type="button">
                        Ok
                    </Button>
                </div>
            </div>
        );

        const successMessage = (
            <div>
                <p className="f4"> User account deactivated.</p>
                <div className="w-100">
                    <Button
                      type="button"
                      onClick={this.onSuccess}
                      expanded
                    > Ok </Button>
                </div>
            </div>
        );

        const body = this.state.success ? successMessage : wholeBody;

        return (
            <MessageModal
              title={<h1>Message</h1>}
              closeModal={this.onCancel}
              isOpen={isOpen}
              wholeBody={body}
            />
        );
    }
}

export default withRouter(connect(mapStateToProps, {
    deactivateUser: appActions.user.deactivateUser,
    logout: appActions.session.logoutUser,
    showMessageModal: appActions.modals.showMessageModal
})(DeactivateUserModal));
