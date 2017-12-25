import React, { PropTypes } from 'react';
import propertyConfig from '../../constants/property.js';

class BookableCaption extends React.Component {

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        const { updateCaption } = this.props;
        updateCaption(e.target.value);
    }

    render() {
        const { bookable } = this.props;
        return (
            <input
              className="ma1 w-100 pa1"
              defaultValue={bookable.caption}
              onChange={this.onChange}
              placeholder={`Caption (max ${propertyConfig.captionText.max} chars)`}
              max={propertyConfig.captionText.max}
            />
        );
    }
}


BookableCaption.propTypes = {
    // bookable: eventPropertyType.isRequired,
    updateCaption: PropTypes.func.isRequired
};

export default BookableCaption;
