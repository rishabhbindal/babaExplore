import React, { PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import Button from '../../Button/Button.jsx';
import messages from '../../../constants/messages.js';
import isMobileDevice from '../../../lib/isMobileDevice.js';
import { eventPropertyType } from '../../../data-shapes/property.js';
import Spinner from '../../Icons/spinner.jsx';

import PropertyImagesField from '../PropertyImagesField/PropertyImagesField.jsx';

class AddImagesForm extends React.Component {

    constructor(props) {
        super(props);

        this.images = [];
        this.uploadedImages = [];
        this.updateCount = 0;
        this.counts = {
            success: 0,
            error: 0
        };

        this.submit = this.submit.bind(this);
        this.pushImageFile = this.pushImageFile.bind(this);
        this.resetImageFiles = this.resetImageFiles.bind(this);
        this.setUpdateCount = this.setUpdateCount.bind(this);

        this.state = { isUploading: false };
    }

    setUpdateCount(newCount) {
        this.updateCount = newCount;
    }

    updateListingImages() {
        const { closeModal, showMessageModal } = this.props;
        const { isBookableImage, reloadImages, property } = this.props;

        this.updateCount -= 1;
        if (this.updateCount === 0) {
            const { bookables } = property;
            if (isBookableImage) {
                if (bookables && bookables.length > 0) {
                    bookables[0].images = bookables[0].images.concat(this.uploadedImages);
                }
            } else {
                property.images = property.images.concat(this.uploadedImages);
            }
            if (this.counts.success > 0) {
                showMessageModal(
                    'Message',
                    messages.PROPERTY_IMAGES_ADD_SUCCESS
                );
            } else {
                showMessageModal(
                    'Message',
                    messages.errors.PROPERTY_IMAGES_ADD
                );
            }
            closeModal();
            reloadImages();
        }
    }

    uploadImage(image, order) {
        const { addPropertyImage, imageType, isBookableImage, propertyUrl } = this.props;
        const { property } = this.props;
        const imageData = {
            image,
            caption: '',
            ordering: order
        };

        if (isBookableImage) {
            imageData.bookable_item = propertyUrl;
        } else {
            imageData.property = propertyUrl;
        }

        addPropertyImage(imageData, property.id, imageType).then((data) => {
            this.uploadedImages.push(data);
            this.counts.success += 1;
            this.updateListingImages();
        }).catch((err) => {
            this.counts.error += 1;
            this.updateListingImages();
            throw Error(err);
        });
    }

    submit() {
        if (this.images.length > 0 && !this.state.isUploading) {
            this.setState({ isUploading: true });
            this.updateCount = this.images.length;
            const length = this.updateCount;
            for (let i = 0; i < length; i += 1) {
                this.uploadImage(this.images[i], i);
            }
        }
    }

    pushImageFile(image, order) {
        if (isMobileDevice()) {
            this.setState({ isUploading: true });
            this.uploadImage(image, order);
        } else {
            this.images.push(image);
        }
    }

    resetImageFiles() {
        this.images = [];
    }

    render() {
        const { closeModal } = this.props;

        return (
            <div className="AddImagesForm pa3">
                { this.state.isUploading &&
                    (
                        <div className="loading-anim small-centered small-12 absolute show-for-small">
                            <Spinner />
                        </div>
                    )
                }
                <div className="AddImagesForm-ProfilePic show-for-medium">
                    <PropertyImagesField
                      submitOnChange
                      extralarge
                      onSubmit={this.submit}
                      addImageFile={this.pushImageFile}
                      resetImageFiles={this.resetImageFiles}
                      setUpdateCount={this.setUpdateCount}
                    />
                    <span className="ma1">
                        <Button bgColor="green" onClick={this.submit}>
                            Submit
                        </Button>
                    </span>
                    <span className="ma1">
                        <Button bgColor="gray" onClick={closeModal}>
                            Cancel
                        </Button>
                    </span>
                </div>
            </div>
        );
    }
}

AddImagesForm.propTypes = {
    property: eventPropertyType.isRequired,
    imageType: PropTypes.string.isRequired,
    propertyUrl: PropTypes.string.isRequired,
    isBookableImage: PropTypes.bool.isRequired,
    addPropertyImage: PropTypes.func.isRequired,
    showMessageModal: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    reloadImages: PropTypes.func.isRequired
};

export default reduxForm({
    form: 'add-property-image'
})(AddImagesForm);
