import React, { PropTypes } from 'react';
import cls from 'classnames';

import './ButtonLoader.scss';

import Button from '../Button/Button.jsx';
import Loader from '../Loader/Loader.jsx';

const ButtonLoader = (props) => {
    const {
        expanded,
        disabled,
        icon,
        size,
        children,
        onClick,
        ...rest
    } = props;

    const { showSpinner } = props;

    return (
        <Button
          disabled={disabled}
          expanded={expanded}
          icon={icon}
          size={size}
          onClick={disabled ? () => {} : onClick}
          {...rest}
        >
            {children}
            {showSpinner && (
                 <span
                   className={cls(
                           'ButtonLoader__loader',
                           size && `ButtonLoader__loader--${size}`
                       )}
                 >
                     <Loader variant="light" size={size} />
                 </span>
             )}
        </Button>
    );
};

ButtonLoader.propTypes = {
    children: PropTypes.node,
    expanded: PropTypes.bool,
    disabled: PropTypes.bool,
    icon: PropTypes.bool,
    size: PropTypes.string, /* arrayOf */
    showSpinner: PropTypes.bool,
    onClick: PropTypes.func
};

export default ButtonLoader;
