import React from 'react';
import cls from 'classnames';
import { Link } from 'react-router-dom';

import './NavLink.scss';

const NavLink = ({ withBorder, children, to, ...props }) => {
    const klass = cls('NavLink', withBorder && 'NavLink--bordered');
    if (!to) {
        return <a href="javascript:;" className={klass} {...props}>{children}</a>;
    }

    return <Link to={to} className={klass} {...props} >{children}</Link>;
};

export default NavLink;
