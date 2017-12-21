import React, { PropTypes } from 'react';
import cls from 'classnames';

import './InputField.scss';

class InputField extends React.Component {
    static propTypes = {
        autoFocus: PropTypes.bool,
        align: PropTypes.oneOf(['left', 'right', 'center']),
        hideError: PropTypes.bool,
        id: PropTypes.string,
        input: PropTypes.shape({
            name: PropTypes.string,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool])
        }),
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
        labelAfter: PropTypes.bool,
        placeholder: PropTypes.string,
        type: PropTypes.string,
        maxLength: PropTypes.number,
        meta: PropTypes.shape({
            touched: PropTypes.bool,
            error: PropTypes.string
        }),
        varient: PropTypes.string
    }

    constructor(props) {
        super(props);
        this.handleTab = this.handleTab.bind(this);
    }

    /**
     * @see https://github.com/ayoola-solomon/react-input-auto-tab/blob/master/src/Autotab.js
     */
    handleTab(e) {
        const target = e.target;
        const input = target.value;

        if (input.length >= this.props.maxLength) {
            let next = target.parentElement.nextElementSibling;
            while (next) {
                if (next.classList.contains('InputField') && next.querySelector('input')) {
                    next.querySelector('input').focus();
                    break;
                }
                next = next.nextElementSibling;
            }
        }
    }

    scrollIntoView(e) {
        if (/(android)/i.test(navigator.userAgent)) {
            e.target.scrollIntoView();
        }
    }

    render() {
        const { input, label, labelAfter, id, meta: { touched, error }, varient, floatLabel, transientLabel } = this.props;
        const { hideError } = this.props;
        const hasError = touched && error;

        const klass = cls('InputField', {
            'InputField--error': hasError,
            'InputField--plain': varient === 'plain' || varient === 'smallDOB',
            'InputField--cc': varient === 'countryCode' || varient === 'countryCodeSmall' || varient === 'signupSmall',
            'InputField--small': varient === 'small' || varient === 'countryCodeSmall' || varient === 'smallDOB',
            'InputField--signup': varient === 'signin-modal' || varient === 'signupSmall',
            'InputField--transient-label': transientLabel
        });

        const labelEl = (
            <label
              htmlFor={input.name}
              className={floatLabel && 'fr mb2'}
            > {label} </label>);

        const align = this.props.align || 'center';

        const errorClass = varient === 'signin-modal' && 'f6 w-100 tl light-red';
        return (
            <div className={klass}>
                {!labelAfter && labelEl}
                <input
                  {...input}
                  id={id}
                  autoFocus={this.props.autoFocus}
                  placeholder={this.props.placeholder}
                  maxLength={this.props.maxLength}
                  type={this.props.type}
                  onKeyUp={this.props.maxLength ? this.handleTab : null}
                  onFocus={this.scrollIntoView}
                  style={{ textAlign: align }}
                />
                {labelAfter && labelEl}
                { hasError && !hideError && <div className={errorClass}>{error}</div>}
            </div>
        );
    }
}

export default InputField;
