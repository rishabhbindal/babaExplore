import React, { PropTypes } from 'react';
import cls from 'classnames';

import './JLink.scss';

const JLink = ({ onClick, children, className, ...props }) => (
    <button {...props} className={cls('JLink', className)} onClick={onClick}>
        {children}
    </button>
);

JLink.propTypes = {
    onClick: PropTypes.func,
    children: PropTypes.node,
    className: PropTypes.string
};

export default JLink;
