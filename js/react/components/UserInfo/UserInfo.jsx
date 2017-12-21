import React, { PropTypes } from 'react';
import cn from 'classnames';

import UserAvatar from '../UserAvatar/UserAvatar.jsx';
import UserQuote from '../UserQuote/UserQuote.jsx';

import './UserInfo.scss';

const UserInfo = ({ img = '/images/user.jpg', name, quote, fullWidth, center } = {}) => {
    const className = cn('UserInfo', { 'UserInfo__fullWidth': fullWidth, 'UserInfo__center': center });
    return (
        <div className={className}>
            <div className="UserInfo__avatar">
                <UserAvatar img={img} desc={name} />
            </div>
            <div className="UserInfo_quote">
                <UserQuote name={name.split(' ')[0]} quote={quote} />
            </div>
            <div className="clearfix" />
        </div>
    );
};
UserInfo.propTypes = {
    img: PropTypes.string,
    name: PropTypes.string,
    about: PropTypes.string,
    fullWidth: PropTypes.bool,
    center: PropTypes.bool
};

export default UserInfo;
