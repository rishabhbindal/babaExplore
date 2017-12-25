import React, { PropTypes } from 'react';
import { withRouter, Link } from 'react-router-dom';
import cls from 'classnames';

import './LoginModal.scss';

import Modal from '../Modal/Modal.jsx';
import ForgotPasswordModal from '../ForgotPasswordModal/ForgotPasswordModal.jsx';
import LoginForm from './LoginForm.jsx';
import SignupFormContainer from '../../containers/SignupFormContainer.jsx';
import Artwork from '../Icons/Artwork.jsx';

const setUrlHash = (hash = '') => {
    window.location.hash = hash; // eslint-disable-line no-undef
};

class LoginModal extends React.Component {
    static propTypes = {
        loginModalVisibility: PropTypes.shape({
            visible: PropTypes.bool,
            showSignup: PropTypes.bool
        }).isRequired,
        setSession: React.PropTypes.func,
        toggleLogin: React.PropTypes.func,
        displayForgotPasswordModal: PropTypes.bool,
        hideForgotPasswordModal: PropTypes.func,
        resetPassword: PropTypes.func
    }

    constructor(props) {
        super(props);
        this.closeModal = this.closeModal.bind(this);
        this.setFormType = this.setFormType.bind(this);
        this.state = { show: 'signin' };
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.loginModalVisibility.visible && !this.props.loginModalVisibility.visible) {
            const show = nextProps.loginModalVisibility.showSignup ? 'signup' : 'signin';
            this.setState({ show });
            if (show === 'signup') {
                setUrlHash('signup');
            }
        }
    }

    setFormType(show) {
        this.setState({ show });
        const hash = show === 'signup' ? 'signup' : '';
        setUrlHash(hash);
    }

    closeModal() {
        const { toggleLogin } = this.props;
        toggleLogin(false);
        setUrlHash('');
    }

    render() {
        const {
            submitting, toggleLogin, loginModalVisibility,
            login, setSession, loginFailed, loginErrorMessage,
            setShouldRedirectAfterSignup
        } = this.props;
        const { show } = this.state;
        const showSignup = show === 'signup';
        const showSignin = show === 'signin';

        const handleSubmit = (values) => {
            const payload = { username: values.email, password: values.password };
            return login(payload)
                 .then(setSession)
                 .then(() => {
                     toggleLogin(false);
                 })
                 .catch((e) => {
                     console.warn('login failure.', e);
                 });
        };

        const showForgotPassword = () => {
            toggleLogin();
            this.props.showForgotPasswordModal();
        };

        return (
            <div>
                <Modal
                  isOpen={loginModalVisibility.visible}
                  closeModal={this.closeModal}
                  titleNode={null}
                  klassName="SignUp--modal"
                  disableCloseOnClick
                >
                    <div style={{ minHeight: 'calc(85vh - 16rem)' }}>
                    <div className="w-100 tc mv4">
                        <div
                          className={cls(
                              'w-50 dib bb bw2 LoginForm--selection',
                              showSignin && 'LoginForm--activeSelection'
                          )}
                          onClick={() => this.setFormType('signin')}
                          role="button"
                          tabIndex={0}
                        >
                            <p className="ma0 f3 lh-solid">SIGN IN</p>
                            <p className="ma0 f6">Welcome Back</p>
                        </div>
                        <div
                          className={cls(
                              'dib w-50 bb bw2 LoginForm--selection',
                              showSignup && 'LoginForm--activeSelection'
                          )}
                          onClick={() => this.setFormType('signup')}
                          role="button"
                          tabIndex={0}
                        >
                            <p className="ma0 f3 lh-solid">SIGN UP</p>
                            <p className="ma0 f6">Join Us</p>
                        </div>
                    </div>
                    { showSignin && <LoginForm
                      onSubmit={handleSubmit}
                      submitting={submitting}
                      loginFailed={loginFailed}
                      loginErrorMessage={loginErrorMessage}
                      showForgotPassword={showForgotPassword}
                    /> }
                    { showSignup && <SignupFormContainer /> }
                    </div>
                    <div className="ArtworkContainer">
                        <Artwork />
                    </div>
                    <div className="pa3 tc cb" style={{ fontSize: '0.7rem' }}>
                        By joining ExploreLifeTraveling, i agree to <a
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                        >Terms and Conditions</a>
                    </div>
                </Modal>
                <ForgotPasswordModal
                  displayForgotPasswordModal={this.props.displayForgotPasswordModal}
                  hideForgotPasswordModal={this.props.hideForgotPasswordModal}
                  resetPassword={this.props.resetPassword}
                  toggleLogin={toggleLogin}
                />
            </div>
        );
    }
}

export default withRouter(LoginModal);
