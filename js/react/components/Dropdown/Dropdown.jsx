import React, { PropTypes } from 'react';

const Dropdown = React.createClass({
    propTypes: {
        id: PropTypes.string.isRequired,
        options: PropTypes.array.isRequired,
        value: PropTypes.oneOfType(
            [
                PropTypes.number,
                PropTypes.string
            ]
        ),
        valueField: PropTypes.string,
        labelField: PropTypes.string,
        onChange: PropTypes.func
    },

    getInitialState() {
        return {
            selected: this.props.selected
        };
    },

    getDefaultProps() {
        return {
            value: null,
            valueField: 'value',
            labelField: 'label',
            onChange: null
        };
    },

    handleChange(e) {
        const { onChange } = this.props;
        if (onChange) {
            this.setState({
                selected: e.target.value
            });
            onChange(e.target.value);
        }
        return true;
    },

    render() {
        const self = this;
        const options = self.props.options.map(option =>
            (
                <option key={option} value={option}>
                    {option}
                </option>
            )
        );
        return (
            <select
              id={this.props.id}
              className="form-control"
              value={this.state.selected}
              onChange={this.handleChange}
            >
                {options}
            </select>
        );
    }
});

export default Dropdown;
