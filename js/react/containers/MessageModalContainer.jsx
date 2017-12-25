import React from 'react';
import { connect } from 'react-redux';

import MessageModal from '../components/MessageModal/MessageModal.jsx';

import { getState as appState, actions as appActions } from '../reducers';

const mapStateToProps = (state) => {
    const modal = appState.modals.getMessageModal(state);
    const showModal = !!modal;

    return {
        isOpen: showModal,
        title: modal && modal.title && <h1>{modal.title}</h1>,
        message: modal && modal.content
    };
};

export default connect(mapStateToProps, {
    closeModal: appActions.modals.hideMessageModal
})(MessageModal);
