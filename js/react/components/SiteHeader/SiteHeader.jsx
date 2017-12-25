import React, { PropTypes } from 'react';
import { Route } from 'react-router-dom';

import './SiteHeader.scss';

import Logo from '../Logo/Logo.jsx';
import NavLink from '../NavLink/NavLink.jsx';
import LoginModal from '../LoginModal/LoginModal.jsx';
import MessageModalContainer from '../../containers/MessageModalContainer.jsx';
import messages from '../../constants/messages.js';

const SiteHeader = (props) => {
    const {
        user, isLoggedIn, toggleLogin, loginModalVisibility,
        setSession, login, loginFailed, loginErrorMessage, showMessageModal, hideForgotPasswordModal, displayForgotPasswordModal, showForgotPasswordModal, resetPassword, setShouldRedirectAfterSignup
    } = props;

    let sessionNav;

    const { history } = props;

    const gotoHost = () => history.push('/host');
    const onLogout = () => props.logout();
    const gotoDashboard = () => history.push('/user-dashboard');
    const gotoSignup = () => {
        toggleLogin(true, true);
    };
    const toEventsPage = () => history.push('/events/');
    const toSearchPage = () => history.push('/search/');

    const toCreateProperty = () => showMessageModal(
        messages.CREATE_PROPERTY_MODAL_TITLE,
        messages.CREATE_PROPERTY_MODAL_MESSAGE
        );

    const handleMobileMenu = (event) => {
        switch (event.target.value) {
        case 'DASHBOARD':
            return gotoDashboard();
        case 'SIGN_IN':
            return toggleLogin(true);
        case 'SIGN_UP':
            return gotoSignup();
        case 'LOGOUT':
            return onLogout();
        case 'SHARE_SPACE':
            return toCreateProperty();
        case 'HOST':
            return gotoHost();
        case 'TO_EVENTS':
            return toEventsPage();
        case 'TO_SEARCH':
            return toSearchPage();
        default:
            return null;
        }
    };

    const signinHandler = (e) => {
        e.preventDefault();
        toggleLogin(true);
    };

    if (!isLoggedIn) {
        sessionNav = (
            <span className="navSpacing">
                <NavLink navStyle className="notNavCss navStyle" onClick={signinHandler}>Login</NavLink>
                    <span style={{marginLeft:'5px',marginRight:'5px'}}>/</span>
                <NavLink className="notNavCss navStyle" onClick={gotoSignup}>Signup</NavLink>
            </span>
        );
    } else {
        sessionNav = (
            <span>
                { user && user.isHost && <NavLink to="/host">Host Dashboard</NavLink> }
                <NavLink to="/user-dashboard">User Dashboard</NavLink>
                <NavLink withBorder onClick={props.logout}>Log out</NavLink>
            </span>
        );
    }

    const backButtonRoutes = [
        {
            path: '/events/:eventCode',
            component: () => (
                <div className="SiteHeader__link" style={{ textAlign: 'left' }}>
                    <NavLink onClick={toEventsPage}>« Back To Events</NavLink>
                </div>
            )
        }, {
            path: '/listing/:listingCode',
            component: () => (
                <div className="SiteHeader__link" style={{ textAlign: 'left' }}>
                    <NavLink onClick={toSearchPage}>« Back To Search</NavLink>
                </div>
            )
        }
    ];

    const mobileBackButtonRoutes = [
        {
            path: '/events/:eventCode',
            component: () => (<option value="TO_EVENTS">All Events</option>)
        }, {
            path: '/listing/:listingCode',
            component: () => (<option value="TO_SEARCH">Search Listings</option>)
        }
    ];

    return (
        <div>
            <div className="SiteHeader show-for-medium">
                <div className="SiteHeader__link SiteHeader__logo">
                    <Logo />
                </div>

                {backButtonRoutes.map((route, index) => (
                    <Route
                      key={index}
                      path={route.path}
                      component={route.component}
                    />
                  ))}
                <div className="SiteHeader__link">
                    <NavLink navStyle className="notNavCss navStyle navSpacing" to="/experiential-stays">Experimental stays</NavLink>
                    <NavLink navStyle className="notNavCss navStyle navSpacing" to="/events">Events</NavLink>
                    <NavLink className="notNavCss shareBtn navSpacing" onClick={toCreateProperty}><span style={{margin:'auto'}}>Share your room</span></NavLink>
                    {sessionNav}
                </div>
            </div>
            <div className="SiteHeader hide-for-medium">
                <div className="SiteHeader__link SiteHeader__logo">
                    <Logo />
                </div>

                <div className="mobile__menu">
                    <select value='default' onChange={ handleMobileMenu }>
                        <option value='default'>≡</option>
                        <option value='SHARE_SPACE'>Share Your Space</option>
                        { !isLoggedIn && (<option value="SIGN_IN">Sign In</option>)}
                        { !isLoggedIn && (<option value="SIGN_UP">Sign Up</option>)}
                        { user && user.isHost && isLoggedIn && (<option value="HOST">Host Dashboard</option>)}
                        { isLoggedIn && (<option value="DASHBOARD">User Dashboard</option>)}
                        { isLoggedIn && (<option value="LOGOUT">Log out</option>)}
                        {mobileBackButtonRoutes.map((route, index) => (
                            <Route
                              key={index}
                              path={route.path}
                              component={route.component}
                            />
                          ))}
                    </select>
                </div>
            </div>
            <LoginModal
              setSession={setSession}
              login={login}
              loginFailed={loginFailed}
              loginErrorMessage={loginErrorMessage}
              toggleLogin={toggleLogin}
              loginModalVisibility={loginModalVisibility}
              displayForgotPasswordModal={displayForgotPasswordModal}
              showForgotPasswordModal={showForgotPasswordModal}
              hideForgotPasswordModal={hideForgotPasswordModal}
              resetPassword={resetPassword}
              setShouldRedirectAfterSignup={setShouldRedirectAfterSignup}
            />
        </div>
    );
};

SiteHeader.propTypes = {
    logout: PropTypes.func.isRequired
};

export default SiteHeader;
