import React, { PropTypes } from 'react';
import cn from 'classnames';

import './UserAvatar.scss';

const sizeClass = {
    small: 'UserAvatar--small',
    medium: '',
    large: 'UserAvatar--large',
    extralarge: 'UserAvatar--extralarge'
};

const UserAvatar = ({ img, desc, size, children, onClick }) => (
    <div
      className={cn('UserAvatar', sizeClass[size])}
      style={{
          backgroundImage: `url(${img})`,
          cursor: onClick ? 'pointer' : 'auto'
      }}
      onClick={onClick}
    >
        <img className="UserAvatar__img" src={img} alt={desc} />
        {children}
    </div>
);

UserAvatar.propTypes = {
    desc: PropTypes.string,
    img: PropTypes.string,
    size: PropTypes.oneOf(['small', 'medium', 'large', 'extralarge']),
    children: PropTypes.node,
    onClick: PropTypes.func
};

export default UserAvatar;
