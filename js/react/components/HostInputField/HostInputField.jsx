import React, { PropTypes } from 'react';
import cls from 'classnames';
import './HostInputField.scss';

class HostInputField extends React.Component {
    static propTypes = {
        autoFocus: PropTypes.bool,
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
                if (next.classList.contains('HostInputField') && next.querySelector('input')) {
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
        const { input, label, labelAfter, id, meta: { touched, error }, varient } = this.props;
        const { hideError } = this.props;
        const hasError = touched && error;

        const klass = cls('HostInputField', {
            'HostInputField--error': hasError,
            'HostInputField--plain': varient === 'plain',
            'HostInputField--cc': varient === 'countryCode'
        });

        const labelEl = (label && <label htmlFor={input.name}> {label} </label>);

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
                />
                {labelAfter && labelEl}
                { hasError && !hideError && <div>{error}</div>}
            </div>
        );
    }
}

export default HostInputField;
