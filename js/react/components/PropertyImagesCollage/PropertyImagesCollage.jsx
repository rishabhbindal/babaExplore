import React, { PropTypes } from 'react';
import './PropertyImagesCollage.scss';

const PropertyImagesCollage = ({ property, tiggerPropertyImageModal}) => {
    const images = (
        property.images.length < 3 ?
        [
            ...property.images,
            ...[].concat.apply([], property.bookables.map(b => b.images))
        ] :
        property.images
    );

    const currentImageIndex = 0;

    return (
        <div onClick={tiggerPropertyImageModal} className="property-image-conatiner">
            {
                images.length > 0 &&
                images.slice(0, 1).map(({ medium, small }, index) =>
                    (
                        index === currentImageIndex && 
                        <img
                          src={small || medium}
                          className="property-image"
                        />
                    )
                )
            }
            {
                !images.length && (
                    <div className="property-image"></div>
                )
            }
        </div>
    );
};

PropertyImagesCollage.propTypes = {
    property: PropTypes.object,
    tiggerPropertyImageModal: PropTypes.func
};

export default PropertyImagesCollage;
