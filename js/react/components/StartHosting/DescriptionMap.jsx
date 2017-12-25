import React, { Component, PropTypes } from 'react';

class DescriptionMap extends Component {
    static propTypes = {
        descKey: PropTypes.string.isRequired,
        descValue: PropTypes.string.isRequired,
        index: PropTypes.number.isRequired,
        onDescriptionChange: PropTypes.func.isRequired,
        deleteKey: PropTypes.func.isRequired
    }
    constructor(props) {
        super(props);
        const { descKey, descValue } = this.props;

        this.data = {
            key: descKey,
            value: descValue
        };

        this.onKeyChange = this.onKeyChange.bind(this);
        this.onValueChange = this.onValueChange.bind(this);
    }

    onKeyChange(e) {
        const { index, onDescriptionChange } = this.props;
        const obj = {
            key: e.target.value,
            value: this.data.value
        };
        onDescriptionChange(index, obj);
        this.data.key = e.target.value;
    }

    onValueChange(e) {
        const { index, onDescriptionChange } = this.props;
        const obj = {
            value: e.target.value,
            key: this.data.key
        };
        onDescriptionChange(index, obj);
        this.data.value = e.target.value;
    }

    render() {
        const { deleteKey, index, descKey, descValue } = this.props;
        return (
            <div className="row">
                <label htmlFor="description" className="pa1 fl small-12 medium-3">
                    <input type="text" onBlur={this.onKeyChange} placeholder="description key" defaultValue={descKey} />
                </label>
                <div id="description" className="fl small-8 medium-6">
                    <textarea
                      rows="4"
                      className="mv1 w-100 pa1 b--black-10"
                      placeholder="Description"
                      onChange={this.onValueChange}
                      value={descValue}
                    />
                </div>
                <div className="fl small-4 medium-3">
                    <button className="w-100 ma2 bg-gray pa2 white" onClick={() => deleteKey(index)}>Delete</button>
                </div>
            </div>
        );
    }
}

export default DescriptionMap;
