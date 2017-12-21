import React, { PropTypes } from 'react';
import cls from 'classnames';

import './Button.scss';

const getBgColorCls = color => {
    switch (color) {
    case 'green':
        return 'bg-green hover-bg-dark-green';
    case 'gray':
        return 'bg-gray hover-bg-dark-gray';
    case 'fb-blue':
        return 'bg-fb-blue';
    case 'red':
        return 'bg-red hover-bg-dark-red';
    default:
        return 'bg-red hover-bg-dark-red';
    }
};

const Button = ({ children, boldTxt, plain, disabled, expanded, icon, size, onClick, bgColor, showSpinner, rounded, roundedSmall, largeText, ...rest }) => {
    const klass = cls(
        'Button', {
            'Button--disabled': disabled,
            'Button--icon': icon,
            'Button--expand': expanded,
            'Button--plain': plain,
            'Button--rounded': rounded,
            'Button--rounded-small': roundedSmall,
            'Button--larger-text': largeText
        },
        size && `Button--${size}`,
        boldTxt && 'b',
        getBgColorCls(bgColor),
        rest.relative && 'relative'
    );

    return (
        <button
          disabled={disabled}
          className={klass}
          onClick={onClick}
          {...rest}
        >
            {children}
        </button>
    );
};
Button.propTypes = {
    children: PropTypes.node,
    plain: PropTypes.bool,
    disabled: PropTypes.bool,
    expanded: PropTypes.bool,
    icon: PropTypes.bool,
    size: PropTypes.string,
    bgColor: PropTypes.oneOf(['green', 'blue', 'red', 'fb-blue']),
    boldTxt: PropTypes.bool
};

export default Button;
