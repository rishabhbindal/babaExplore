import React, { PropTypes } from 'react';
import './PropertyImagesModal.scss';
import PropertImagesSlider from '../PropertyImagesSlider/PropertyImagesSlider.jsx'

const PropertyImagesModal = ({ property }) => {
    let userInfo = (
        <div>
            <div className="property-caption">{property.caption}</div>
            <div className="property-location">{property.location}</div>
        </div>
    );
    
    return (
        <div className="property-images-modal">
            {userInfo}
            <PropertImagesSlider property={property}/>
        </div>     
    );
};


export default PropertyImagesModal;
