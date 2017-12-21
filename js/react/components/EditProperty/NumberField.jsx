import React, { PropTypes } from 'react';

class NumberField extends React.Component {
    static defaultProps = {
        min: 1,
        value: 0
    };

    static propTypes = {
        value: PropTypes.number,
        min: PropTypes.number,
        title: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.state = { isValid: true };
        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        const { onChange, name, min } = this.props;

        this.setState({ isValid: e.target.value >= min });
        onChange(e, name);
    }

    render() {
        const { title, value, min } = this.props;
        const style = { borderColor: this.state.isValid ? 'black' : 'red' };
        return (
            <div className="w-100 pa0 ma0">
                <span className="">{title}</span>
                <input
                  className="bb"
                  type="number"
                  defaultValue={value}
                  onChange={this.onChange}
                  min={min}
                  style={style}
                />
            </div>
        );
    }

}
export default NumberField;
