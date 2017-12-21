import React, { PropTypes } from 'react';
import { eventPropertyType } from '../../data-shapes/property.js';

class CaptionLocation extends React.Component {

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
    }

    onChange(e) {
        const { updateCaption } = this.props;
        updateCaption(e.target.value);
    }

    render() {
        const { property, isEditable } = this.props;
        return (
            <div>
                <h4 className="fl ma0 w-50">
                    {
                        isEditable ? (
                            <div className="ba b--white pa1">
                                <input
                                  defaultValue={property.caption}
                                  onChange={this.onChange}
                                  className="bg-transparent white w-100 bn"
                                />
                            </div>
                        ) : property.caption
                    }
                </h4>
                <div className="fr w-50 tr Listing__CaptionLocation">
                    { property.locality ? `${property.locality}, ` : '' }{property.city}
                </div>
            </div>
        );
    }
}

CaptionLocation.defaultProps = {
    isEditable: false
};


CaptionLocation.propTypes = {
    isEditable: PropTypes.bool,
    property: eventPropertyType.isRequired,
    updateCaption: PropTypes.func.isRequired
};

export default CaptionLocation;
