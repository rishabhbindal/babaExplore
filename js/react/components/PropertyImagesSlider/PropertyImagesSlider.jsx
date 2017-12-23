import React, { PropTypes } from 'react';

class PropertImagesSlider extends React.Component {


    render() {
        return (
            <div>
             {
                this.props.property.images.length > 0 &&
                this.props.property.images.slice(0, 1).map((image, index) =>
                    (
                        <img
                          src={image.small || image.medium}
                          className="property-image"
                        />
                    )
                )
            }
        </div>
        );
    }
}

export default PropertImagesSlider;
