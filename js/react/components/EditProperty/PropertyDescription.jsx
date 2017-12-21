import React, { PropTypes } from 'react';
import { eventPropertyType } from '../../data-shapes/property.js';

class PropertyDescription extends React.Component {

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        const { updatePropertyDescription } = this.props;
        updatePropertyDescription(e.target.value);
    }

    render() {
        const { character } = this.props.property;
        return (
            <textarea
              rows="4"
              className="ma1 w-100 pa1 b--black-10"
              defaultValue={character}
              onChange={this.onChange}
            />
        );
    }
}


PropertyDescription.propTypes = {
    property: eventPropertyType.isRequired,
    updatePropertyDescription: PropTypes.func.isRequired
};

export default PropertyDescription;
