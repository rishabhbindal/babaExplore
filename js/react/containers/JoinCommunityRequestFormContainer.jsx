import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import MessageModal from '../components/MessageModal/MessageModal.jsx';
import ButtonLoader from '../components/ButtonLoader/ButtonLoader.jsx';
import { actions as appActions, getState as appState } from '../reducers';
import messages from '../constants/messages.js';


const mapStateToProps = state => ({
    isOpen: appState.modals.showJoinCommunitiesModal(state) || false
});

class ModalBookingSuccessContainer extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        closeModal: PropTypes.func.isRequired,
        sendRequest: PropTypes.func.isRequired,
        communityName: PropTypes.string.isRequired
    }

    constructor(props) {
        super(props);

        this.onCancel = this.onCancel.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.onTextChange = this.onTextChange.bind(this);

        this.state = {};
    }

    onCancel() {
        this.props.closeModal();
    }

    onSubmit(e) {
        e.preventDefault();
        const { message } = this.state;
        if (message && message.length > 0) {
            this.setState({ error: false });
            this.props.closeModal();
            this.props.sendRequest(this.state.message, this.props.communityName);
        } else {
            this.setState({ error: true });
        }
    }

    onTextChange(e) {
        this.setState({ message: e.target.value });
    }

    render() {
        const { error } = this.state;

        const body = (
            <form onSubmit={this.onSubmit}>
                <p> {messages.JOIN_COMMUNITIES_MODAL_MESSAGE} </p>

                <textarea
                  rows="3"
                  style={{ border: '1px solid #cacaca', marginBottom: (error ? 0 : '1rem') }}
                  placeholder="Message"
                  value={this.state.message}
                  onChange={this.onTextChange}
                />
                { error && <div className="JoinCommunityRequest--error">Please enter Message</div> }
                <div className="clearfix">
                    <div className="JoinCommunityRequest--Button">
                        <a onClick={this.onCancel} className="Button Button--expand">
                            Cancel
                        </a>
                    </div>
                    <div className="JoinCommunityRequest--Button">
                        <ButtonLoader expanded onClick={this.onSubmit}>
                            Ok
                        </ButtonLoader>
                    </div>
                </div>
            </form>
        );

        return (
            <MessageModal
              klassName="Notification-modal"
              title={<h1>Message</h1>}
              closeModal={this.onCancel}
              isOpen={this.props.isOpen}
              wholeBody={body}
            />
        );
    }
}


export default connect(mapStateToProps, {
    closeModal: appActions.modals.hideJoinCommunitiesModal,
    sendRequest: appActions.community.createJoinRequest
})(ModalBookingSuccessContainer);
