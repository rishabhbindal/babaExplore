import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import { withRouter } from 'react-router-dom';

import MessageModal from '../components/MessageModal/MessageModal.jsx';

import messages from '../constants/messages.js';
import { actions as appActions, getState as appState } from '../reducers';

const mapStateToProps = state => ({
    isOpen: appState.modals.shouldShowMissingDetailsModal(state)
});

class MissingDetailsModalContainer extends React.Component {
    static defaultProps = {
        isOpen: false,
        message: ''
    }

    static propTypes = {
        isOpen: PropTypes.bool,
        message: PropTypes.string,
        shouldShowMissingDetailsModal: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        // navigate to missing details page when value of isOpen passed to
        // modal changes. Trying to modify history in closeModal function
        // will cause the function to be called twice as the page transition
        // happens before store is updated and componentWillUnmount function
        // from the Modal will call closeModal again, this results in putting
        // the missing-details page twice on the history stack
        if (this.props.isOpen && !nextProps.isOpen) {
            const { history } = this.props;
            history.push('/missing-details');
        }
    }

    closeModal() {
        this.props.shouldShowMissingDetailsModal(false);
    }

    render() {
        const { isOpen, message } = this.props;

        return (
            <MessageModal
              title={<h1>{messages.MISSING_DETAILS_MODAL_TITLE}</h1>}
              closeModal={this.closeModal}
              isOpen={isOpen}
              message={message || messages.MISSING_DETAILS_MODAL_MESSAGE}
            />
        );
    }
}

export default withRouter(connect(mapStateToProps, {
    shouldShowMissingDetailsModal: appActions.modals.shouldShowMissingDetailsModal
})(MissingDetailsModalContainer));
