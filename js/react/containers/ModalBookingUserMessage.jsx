import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import MessageModal from '../components/MessageModal/MessageModal.jsx';

import { actions as appActions, getState as appState } from '../reducers';
import messages from '../constants/messages.js';


const mapStateToProps = state => ({
    isOpen: appState.modals.isOrderAskUserMessageOpen(state),
    showOrderChangeMessage: appState.modals.showOrderChangeMessage(state)
});

class ModalBookingSuccessContainer extends React.Component {
    static defaultProps = {
        isOpen: false,
        showOrderChangeMessage: false
    }

    static propTypes = {
        isOpen: PropTypes.bool,
        showOrderChangeMessage: PropTypes.bool,
        closeModal: PropTypes.func.isRequired,
        onCancelMessage: PropTypes.func.isRequired,
        onMessage: PropTypes.func.isRequired,
        modifyRequest: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        this.onCancel = this.onCancel.bind(this);
        this.onOk = this.onOk.bind(this);
        this.onTextChange = this.onTextChange.bind(this);

        this.state = {};
    }

    onCancel() {
        this.props.closeModal();
        this.props.onCancelMessage();
    }

    onOk() {
        this.props.closeModal();
        const { showOrderChangeMessage } = this.props;
        const { onMessage, modifyRequest } = this.props;
        const action = showOrderChangeMessage ? modifyRequest : onMessage;
        action(this.state.message);
    }

    onTextChange(e) {
        this.setState({ message: e.target.value });
    }

    render() {
        const message = this.props.showOrderChangeMessage ? messages.ORDER_USER_ASK_MESSAGE_ORDER_CHANGE : messages.ORDER_USER_ASK_MESSAGE;
        const body = (
            <form>

                <p> {message} </p>

                <textarea
                  rows="3"
                  style={{ border: '1px solid #cacaca' }}
                  placeholder="Message"
                  value={this.state.message}
                  onChange={this.onTextChange}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <button type="button" className="button" onClick={this.onCancel}>
                        Cancel
                    </button>

                    <button type="button" className="button" onClick={this.onOk}>
                        Ok
                    </button>
                </div>
            </form>
        );

        return (
            <MessageModal
              klassName='Notification-modal'
              title={<h1>Message</h1>}
              closeModal={this.onCancel}
              isOpen={this.props.isOpen}
              wholeBody={body}
            />
        );
    }
}


export default connect(mapStateToProps, {
    closeModal: appActions.modals.hideOrderAskUserMessage,
    onMessage: appActions.order.createOrder,
    onCancelMessage: appActions.order.ignoreBooking,
    modifyRequest: appActions.order.modifyRequest
})(ModalBookingSuccessContainer);
