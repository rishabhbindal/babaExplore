import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { actions } from '../../../reducers';

import LightBox from '../../LightBox/LightBox.jsx';
import { imageTypes } from '../../../constants/images.js';
import EditImagesForm from '../EditImagesForm/EditImagesForm.jsx';

import { eventPropertyType } from '../../../data-shapes/property.js';

class EditPropertyImagesModal extends React.Component {

    constructor(props) {
        super(props);

        this.state = {};
        this.state.imageType = imageTypes.PROPERTY;
    }

    render() {
        const { closeModal, addPropertyImage, updatePropertyImage, deletePropertyImage, showMessageModal } = this.props;
        const { reloadImages, propertyUrl, isBookableImage } = this.props;

        return (
            <div className="w-100 h-100 relative">
                <div className="EditPropertyImagesModal-container modal-no-m-p  bg-gray">
                    <LightBox
                      isOpen
                      closeModal={closeModal}
                    >
                        <EditImagesForm
                          {...this.props}
                          imageType={this.state.imageType}
                          isBookableImage={isBookableImage}
                          updatePropertyImage={updatePropertyImage}
                          deletePropertyImage={deletePropertyImage}
                          closeModal={closeModal}
                          property={this.props.property}
                          addPropertyImage={addPropertyImage}
                          showMessageModal={showMessageModal}
                          propertyUrl={propertyUrl}
                          reloadImages={reloadImages}
                        />
                    </LightBox>
                </div>
            </div>
        );
    }
}

EditPropertyImagesModal.propTypes = {
    property: eventPropertyType.isRequired,
    propertyUrl: PropTypes.string.isRequired,
    closeModal: PropTypes.func.isRequired,
    reloadImages: PropTypes.func.isRequired,
    isBookableImage: PropTypes.bool,
    view: PropTypes.string.isRequired,

    addPropertyImage: PropTypes.func.isRequired,
    updatePropertyImage: PropTypes.func.isRequired,
    deletePropertyImage: PropTypes.func.isRequired,
    addPropertyPanoramaImage: PropTypes.func.isRequired,
    addPropertyVideo: PropTypes.func.isRequired,
    showMessageModal: PropTypes.func.isRequired
};

EditPropertyImagesModal.defaultProps = {
    isBookableImage: false
};

export default connect(null, {
    addPropertyImage: actions.property.addPropertyImage,
    updatePropertyImage: actions.property.updatePropertyImage,
    deletePropertyImage: actions.property.deletePropertyImage,
    addPropertyPanoramaImage: actions.property.addPropertyPanoramaImage,
    addPropertyVideo: actions.property.addPropertyVideo,
    showMessageModal: actions.modals.showMessageModal
})(EditPropertyImagesModal);
