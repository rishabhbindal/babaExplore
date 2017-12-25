import React, { PropTypes } from 'react';
import PropertyImagesModal from '../components/PropertyImagesModal/PropertyImagesModal.jsx';

class PropertyImagesModalContainer extends React.Component {
    
    render() {
        const { property } = this.props;
        return (
            <div>
                <div className="modal-overlay"></div>
                <PropertyImagesModal property={property} />
            </div>
        );
    }
}

export default PropertyImagesModalContainer;
