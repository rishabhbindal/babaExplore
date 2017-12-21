import React from 'react';
import FacebookLogin from 'react-facebook-login';

import './SocialSignup.scss';
import FBIcon from './FBIcon.jsx';

const responseFacebook = (res) =>
    console.log(res);

const SocialSignup = () => {
    const fbText = (
        <span className="SocialSignup__text">
            Sign up with facebook
        </span>
    );
    const fbIcon = <span className="SocialSignup__icon"><FBIcon /></span>;

    return (
        <div>
            <h6>Get everything automatically</h6>
            <p className="SocialSignup__subtext">
                Start in one swift move. We’ll get your photo, location and bio, and you can always change it all later.
            </p>

            <FacebookLogin
              appId="411531465722273"
              autoLoad
              fields="name,email,picture"
              scope="public_profile,user_friends"
              callback={responseFacebook}
              textButton={fbText}
              cssClass="SocialSignup_fb"
              icon={fbIcon}
            />
        </div>
    );
};

export default SocialSignup;
