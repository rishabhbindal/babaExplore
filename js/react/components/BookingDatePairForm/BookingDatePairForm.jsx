import cls from 'classnames';
import moment from 'moment';
import React, { PropTypes } from 'react';
import DatePicker from 'react-datepicker';

class ButtonInput extends React.Component {
    static propTypes = {
        openPicker: PropTypes.bool,
        onClick: PropTypes.func,
        value: PropTypes.string,
        disabled: PropTypes.bool
    }

    static defaultProps = {
        openPicker: false,
        onClick: () => {},
        value: null,
        disabled: false
    }

    componentWillMount() {
        this.onPropsChange(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.openPicker && this.props.openPicker !== nextProps.openPicker) {
            this.onPropsChange(nextProps || this.props);
        }
    }

    onPropsChange(props) {
        if (props.openPicker) {
            this.props.onClick();
        }
    }

    render() {
        const { disabled } = this.props;
        const klass = cls(
            'h2 input w4',
            disabled ? 'bg-light-gray gray' : 'bg-white black'
        );

        return (
            <button
              type="button"
              className={klass}
              onClick={this.props.onClick}
            >
                {this.props.value}
            </button>
        );
    }
}

class BookingDatePairForm extends React.Component {
    static propTypes = {
        input: PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
            onChange: PropTypes.func.isRequired
        }).isRequired
    }

    constructor(props) {
        super(props);
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleEndChange = this.handleEndChange.bind(this);
        this.onClickOutside = this.onClickOutside.bind(this);
        this.state = {
            startDate: null,
            endDate: null,
            openFromPicker: false,
            openUntilPicker: false
        };
    }

    componentDidMount() {
        this.updatePickerErrorState(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.updatePickerErrorState(nextProps);
    }

    onClickOutside() {
        this.setState({ openFromPicker: false, openUntilPicker: false });
    }

    updatePickerErrorState({ input: { value }, meta: { error } }) {
        if (!error) {
            this.setState({ openFromPicker: false, openUntilPicker: false });
            return;
        }

        if (!value.from) {
            this.setState({ openFromPicker: true });
        } else if (!value.until) {
            this.setState({ openUntilPicker: true });
        }
    }

    handleStartChange(startDate) {
        this.setState({ startDate });
        const { single, input: { value, onChange } } = this.props;
        let { until } = value;
        if (until && startDate.isAfter(until)) {
            until = null;
        }

        onChange({
            from: startDate,
            until: single ? startDate : until
        });
        /* this.props.onStartChange(startDate);*/
    }

    handleEndChange(endDate) {
        this.setState({ endDate });
        const { input: { value: { from }, onChange } } = this.props;

        onChange({
            from,
            until: endDate
        });
        /* this.props.onEndChange(endDate);*/
    }

    render() {
        const { disabled, single, input: { value } } = this.props;

        const commonProps = {
            dateFormat: 'DD/MMM/YYYY',
            fixedHeight: true,
            withPortal: true,
            onClickOutside: this.onClickOutside
        };

        return (
            <div className="BookingDatePairForm cf">
                <span className="fl w-50 pr2">
                    <div className="f4 white-80 b">Check in</div>
                    <div>
                        <DatePicker
                          customInput={<ButtonInput openPicker={this.state.openFromPicker} />}
                          disabled={disabled}
                          selected={value.from}
                          selectsStart
                          startDate={value.from}
                          endDate={value.until}
                          minDate={moment()}
                          onChange={this.handleStartChange}
                          placeholderText="Select check-in date"
                          {...commonProps}
                        />
                    </div>
                </span>
                <span className={cls('fl pl2 w-50', { 'dn' : single })}>
                    <div className="f4 white-80 b">Check out</div>
                    <div className="relative">
                        <DatePicker
                          customInput={<ButtonInput openPicker={this.state.openUntilPicker} />}
                          disabled={disabled}
                          selected={single ? value.from : value.until}
                          selectsEnd
                          startDate={value.from}
                          endDate={value.until}
                          minDate={moment(value.from).add(1, 'day')}
                          onChange={this.handleEndChange}
                          placeholderText="Select check-out date"
                          {...commonProps}
                        />
                    </div>
                </span>
            </div>
        );
    }
}

export default BookingDatePairForm;
