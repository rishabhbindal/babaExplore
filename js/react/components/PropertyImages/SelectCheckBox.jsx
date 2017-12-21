import React, { Component, PropTypes } from 'react';
import CheckIconSolid from '../Icons/CheckIconSolid.jsx';

class SelectCheckBox extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isChecked: props.isChecked
        };

        this.onChange = this.onChange.bind(this);
        this.onClick = this.onClick.bind(this);
        this.setRef = this.setRef.bind(this);
    }

    componentWillUnmount() {
        this.inputElem = null;
    }

    componentWillReceiveProps(nextProps) {
        const { isChecked } = nextProps;
        this.setState({ isChecked });
    }

    onChange(e) {
        this.setState({ isChecked: !this.state.isChecked });
        this.props.onChange(e);
    }

    onClick() {
        if (this.inputElem) {
            this.inputElem.click();
        }
    }

    setRef(ref) {
        this.inputElem = ref;
    }

    render() {
        const { value } = this.props;
        return (
            <div
              className="absolute pointer br-100 bg-white-70 ba b--red bw1 z-9999"
              style={{ width: '30px', height: '30px', right: '10px', top: '10px' }}
            >
                {
                    this.state.isChecked &&
                    <CheckIconSolid
                      className="absolute"
                      style={{ width: '16px', height: '16px', margin: '5px 0 0 5px' }}
                    />
                }
                <button className="w-100 h-100 absolute top-0" onClick={this.onClick} />
                <input
                  type="checkbox"
                  value={value}
                  onChange={this.onChange}
                  style={{ display: 'none' }}
                  ref={(ref) => { this.setRef(ref); }}
                  checked={this.state.isChecked}
                />
            </div>
        );
    }
}

SelectCheckBox.defaultProps = {
    value: 0
};

SelectCheckBox.propTypes = {
    onChange: PropTypes.func.isRequired,
    value: PropTypes.number

};

export default SelectCheckBox;
