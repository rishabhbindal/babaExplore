import React from 'react';

import cls from 'classnames';

import './Loader.scss';
import LoaderIcon from '../Icons/LoaderIcon.jsx';

/**
 * The loader svg we use, doesn't have any animation. css animation is
 * used to show the spinning. The adwantage is that this should work
 * on IE.
 */

const Loader = ({ size, variant, className }) => {
    const baseClassName = ' Loader';

    const classNames = className + cls(baseClassName,
        variant && `${baseClassName}--${variant}`,
        size && `${baseClassName}--${size}`
    );

    return (
        <div className={classNames}>
            <LoaderIcon />
        </div>
    );
};

Loader.propTypes = {
    /* Default size is medium */
    size: React.PropTypes.oneOf(['small', 'tiny', 'medium', 'large']),
    variant: React.PropTypes.oneOf(['regular', 'light']),
    className: React.PropTypes.string
};

Loader.defaultProps = {
    size: 'medium',
    variant: 'regular',
    className: ''
};

export default Loader;
