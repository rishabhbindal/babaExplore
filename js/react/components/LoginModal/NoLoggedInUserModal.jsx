import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import MessageModal from '../MessageModal/MessageModal.jsx';
import { appActions } from '../../reducers';

const NoLoggedInUserModal = ({ message, isOpen, closeModal, toggleLogin }) => {
    const showSignIn = () => {
        toggleLogin(true);
        closeModal();
    };

    const wholeBody = (
        <div>
            <div className="f4 ma2">
                {message}
            </div>
            <div>
                <button onClick={closeModal} className="bg-gray small-5 mh1 mv2 pa2 white">
                    Cancel
                </button>
                <button onClick={showSignIn} className="bg-red small-5 mv2 mh1 pa2 white">
                    Sign In
                </button>
            </div>
        </div>
    );
    return (
        <MessageModal
          title={<h5>Sign in Error</h5>}
          isOpen={isOpen}
          closeModal={closeModal}
          wholeBody={wholeBody}
        />
    );
};

NoLoggedInUserModal.defaultProps = {
    isOpen: true
};

NoLoggedInUserModal.propTypes = {
    message: PropTypes.string.isRequired,
    isOpen: PropTypes.bool,
    closeModal: PropTypes.func.isRequired,
    toggleLogin: PropTypes.func.isRequired
};


export default connect(null, {
    toggleLogin: appActions.login.toggleLoginModalVisibility
})(NoLoggedInUserModal);
