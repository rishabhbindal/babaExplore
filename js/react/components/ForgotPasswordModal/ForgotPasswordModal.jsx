import { Field, reduxForm, propTypes as formPropTypes, SubmissionError } from 'redux-form';
import React, { PropTypes } from 'react';

import Modal from '../Modal/Modal.jsx';
import InputField from '../InputField/InputField.jsx';
import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';

import { createValidator, emailValidation } from '../../lib/validations.js';

import './ForgotPasswordModal.scss';

const TitleNode = (
    <div className="ForgotPasswordModal__header br-ns bb bw2 bb-0-ns tc f3">
        Reset Password
    </div>
);

const errorMessage = es =>
    (es && Array.isArray(es) && es.map(a => a.trim()).join(', ')) ||
    (es && typeof es === 'object' &&
        Object.keys(es).map(k => `${k}: ${es[k]}`).join(', ')) ||
    'Error in sending Request.';

let BodyNode = ({ submitting, closeModal, handleSubmit, submitSucceeded, error }) => (
    <form
      onSubmit={handleSubmit}
      className="ForgotPasswordModal__body mt6 mt0-ns"
    >
        <Field
          type="text"
          id="email"
          name="email"
          component={InputField}
          placeholder="Enter your Email"
          varient="signin-modal"
        />
        { submitSucceeded && <div className="ForgotPasswordModal__spacer">
            Reset password link is sent on your email id.</div>}
        { error && <div className="pa3 fw5 cb">Please check you have entered registered email correctly.</div> }
        <div style={{ marginTop: '3rem' }} />
        <ButtonLoader
          expanded
          type="submit"
          showSpinner={submitting}
          rounded
        >
            Reset Password
        </ButtonLoader>


        <div className="ForgotPasswordModal__spacer" />

        <ButtonLoader
          expanded
          rounded
          onClick={() => closeModal()}
        >
            Cancel
        </ButtonLoader>
    </form>
);

BodyNode.propTypes = {
    ...formPropTypes,
    closeModal: PropTypes.func,
    handleSubmit: PropTypes.func
};

BodyNode = reduxForm({
    form: 'reset-password',
    validate: createValidator({
        email: emailValidation
    })
})(BodyNode);

class ForgotPasswordModal extends React.Component {
    static propTypes = {
        displayForgotPasswordModal: PropTypes.bool,
        hideForgotPasswordModal: PropTypes.func,
        resetPassword: PropTypes.func,
        toggleLogin: PropTypes.func
    }

    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
    }

    closeModal() {
        this.props.hideForgotPasswordModal();
        this.props.toggleLogin(true);
    }

    render() {
        return (
            <Modal
              isOpen={this.props.displayForgotPasswordModal}
              titleNode={TitleNode}
              closeModal={this.closeModal}
              klassName="ForgotPasswordModal"
            >
                <BodyNode
                  closeModal={this.closeModal}
                  onSubmit={val => this.props.resetPassword(val).catch((e) => {
                      throw new SubmissionError({
                          _error: errorMessage(e)
                      });
                  })}
                />
            </Modal>
        );
    }
}

export default ForgotPasswordModal;
