import React, { PropTypes } from 'react';

import analytics from '../../../lib/analytics.es6.js';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';

class FBLoginButton extends React.Component {
    static defaultProps = {
        buttonText: '',
        isLoggingWithFb: false,
        signup: false
    }

    static propTypes = {
        buttonText: PropTypes.string,
        isLoggingWithFb: PropTypes.bool,
        signup: PropTypes.bool,
        toggleLogin: PropTypes.func.isRequired,
        toggleLoggingWithFb: PropTypes.func.isRequired,
        setSession: PropTypes.func.isRequired,
        fbLogin: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.clearInterval = this.clearInterval.bind(this);
        this.setFB = this.setFB.bind(this);

        this.state = {};
    }

    componentDidMount() {
        if (process.env.ELT_IS_NOT_BROWSER !== 'true') {
            this.interval = setInterval(() => {
                if (window.FB) { // eslint-disable-line no-undef
                    this.setFB();
                }
            }, 1000);
        }
    }

    componentWillUnmount() {
        if (process.env.ELT_IS_NOT_BROWSER !== 'true') {
            this.clearInterval();
        }
    }

    setFB() {
        this.setState({ FB: window.FB }); // eslint-disable-line no-undef
    }

    clearInterval() {
        clearInterval(this.interval);
    }

    render() {
        const { isLoggingWithFb, toggleLogin, toggleLoggingWithFb,
                setSession, fbLogin, buttonText, signup, history } = this.props;
        const loginWithFb = (loginStatus) => {
            toggleLoggingWithFb();
            return fbLogin({ access_token: loginStatus.authResponse.accessToken })
                .then(setSession)
                .then(() => {
                    toggleLoggingWithFb();
                    if (!signup) {
                        toggleLogin(false);
                    }
                })
                .catch((e) => {
                    console.log('fb login failure.', e);
                });
        };
        const handleFbLogin = () => {
            const FB = this.state.FB;

            analytics.fbpTrack('Lead');

            FB.getLoginStatus((loginStatus) => {
                if (loginStatus.status === 'connected') {
                    return loginWithFb(loginStatus);
                }
                FB.login((resp) => {
                    if (resp.status === 'connected') {
                        return loginWithFb(resp);
                    }
                }, { scope: 'email,public_profile' });
            });
        };
        return (
            <span className="relative">
                <ButtonLoader
                  expanded
                  type="submit"
                  showSpinner={isLoggingWithFb}
                  onClick={handleFbLogin}
                  bgColor="fb-blue"
                  roundedSmall
                  disabled={!this.state.FB}
                  relative
                >
                    <span
                      style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: 0,
                          width: '15%',
                          color: 'white',
                          backgroundColor: '#1e4264',
                          paddingTop: '0.4rem',
                          fontSize: '1.25rem',
                          fontWeight: '900',
                          display: 'inline-block',
                          float: 'left'
                      }}
                    >f</span>
                    <span
                      style={{
                          width: '85%',
                          display: 'inline-block',
                          float: 'right'
                      }}
                    >
                        {buttonText}
                    </span>
                </ButtonLoader>
            </span>
        );
    }
}

export default FBLoginButton;
