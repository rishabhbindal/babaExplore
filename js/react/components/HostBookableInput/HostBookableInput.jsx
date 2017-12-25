import React, { PropTypes } from 'react';
import cls from 'classnames';
import './HostBookableInput.scss';

const HostBookableInput = ({ small, title, value, onChange, valid, errorMessage }) => {
    const panelClass = {
        'HostBookableInput__panel--size--small': !!small,
        'HostBookableInput__panel--size--big': !small
    };

    const handleOnChange = (event) => {
        if (typeof onChange === 'function') {
            onChange(event);
        }
    };

    const validationLabel = (
        valid === false &&
        <div className="HostBookableInput__input--error">{ errorMessage }</div>
    );

    return (
        <div className={cls(panelClass)}>
            <label htmlFor={title}>{title}</label>
            <input
              className={cls('HostBookableInput_input', { 'validation-error': (valid === false) })}
              type="text"
              value={value}
              onChange={handleOnChange}
            />
            { validationLabel }
        </div>
    );
};

HostBookableInput.propTypes = {
    small: PropTypes.bool,
    title: PropTypes.string.isRequired,
    value: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.number
    ]).isRequired,
    onChange: PropTypes.func,
    valid: PropTypes.bool,
    errorMessage: PropTypes.string
};

export default HostBookableInput;
