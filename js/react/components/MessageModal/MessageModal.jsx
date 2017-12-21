import React, { PropTypes } from 'react';

import Modal from '../Modal/Modal.jsx';
import './MessageModal.scss';

const MessageModal = ({ title, closeModal, isOpen, message, wholeBody, klassName }) => {
    const titleNode = (
        <div className="MessageModal__header">
            {title}
        </div>
    );

    const messageNode = (
        <div>
            <div className="MessageModal__message">{message}</div>
            <button
              className="MessageModal__button"
              onClick={closeModal}
            >
              Ok
            </button>
        </div>
    );

    const emptyMessage = !message && !wholeBody;

    return (
        <Modal
          klassName={klassName}
          closeModal={closeModal}
          isOpen={isOpen && !emptyMessage}
          titleNode={titleNode}
        >
            {wholeBody || messageNode}
        </Modal>
    );
};

MessageModal.propTypes = {
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    closeModal: PropTypes.func.isRequired,
    isOpen: PropTypes.bool,
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    wholeBody: PropTypes.oneOfType([PropTypes.string, PropTypes.node])
};

export default MessageModal;
