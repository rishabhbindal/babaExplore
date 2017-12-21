import React, { PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import LazyLoad from 'react-lazyload';
import cls from 'classnames';

import Button from '../../Button/Button.jsx';
import messages from '../../../constants/messages.js';
import SortableImages from '../SortableImages/SortableImages.jsx';
import { eventPropertyType } from '../../../data-shapes/property.js';
import Spinner from '../../Icons/spinner.jsx';
import PropertyImagesField from '../PropertyImagesField/PropertyImagesField.jsx';
import isMobileDevice from '../../../lib/isMobileDevice.js';
import idFromURLEnd from '../../../lib/idFromURLEnd.js';
import { youtubeImageHqUrl } from '../../../lib/youtubeHelper.js';
import { viewOptions } from '../../../constants/images.js';

import './EditImagesForm.scss';

const TABS = {
    order: ['photos', 'panorama', 'video'],
    photos: 'Photos',
    panorama: '360˚ View',
    video: 'Video'
};
const isPhotoTypeTab = type => TABS.order[0] === type;
const isPanoTypeTab = type => TABS.order[1] === type;
const isVideoTypeTab = type => TABS.order[2] === type;

class EditImagesForm extends React.Component {

    constructor(props) {
        super(props);

        this.uploadedImages = [];
        this.images = [];
        this.updateCount = 0;
        this.imageIds = [];
        this.deletedImageIds = [];
        this.counts = {
            success: 0,
            error: 0
        };
        this.video = {};
        this.inputElem = null;

        this.state = {
            isUpdating: false,
            isAttachDisabled: true,
            images: [],
            selectedTab: TABS.order[0],
            videoImageUrl: 'https://img.youtube.com/vi/undefined/default.jpg',
            selectedImagesIds: []
        };

        this.updateImageSequence = this.updateImageSequence.bind(this);
        this.checkboxOnChange = this.checkboxOnChange.bind(this);
        this.updateImages = this.updateImages.bind(this);
        this.deleteSelected = this.deleteSelected.bind(this);

        this.submit = this.submit.bind(this);
        this.pushImageFile = this.pushImageFile.bind(this);
        this.resetImageFiles = this.resetImageFiles.bind(this);
        this.setUpdateCount = this.setUpdateCount.bind(this);

        this.onTabClick = this.onTabClick.bind(this);
        this.onYoutubeUrlChange = this.onYoutubeUrlChange.bind(this);
        this.onVideoCaptionChange = this.onVideoCaptionChange.bind(this);

        this.attachImagesToBookable = this.attachImagesToBookable.bind(this);
        this.setRef = this.setRef.bind(this);

        this.onChangeBookable = this.onChangeBookable.bind(this);
    }

    onTabClick(tabName) {
        this.video = {};
        this.setState({ selectedTab: tabName, videoImageUrl: 'https://img.youtube.com/vi/undefined/default.jpg' });
    }


    onYoutubeUrlChange(e) {
        this.video.external_video_link = e.target.value;
        this.setState({ videoImageUrl: youtubeImageHqUrl(this.video.external_video_link) });
    }

    onVideoCaptionChange(e) {
        this.video.caption = e.target.value;
    }

    onChangeBookable = (e) => {
        const { value } = e.target;
        if (value === '') {
            this.imageIds = [];
            this.setState({ selectedImagesIds: [], isAttachDisabled: true });
        } else {
            this.imageIds = this.getSelectedImageIds(e.target.value);
            this.setState({ selectedImagesIds: this.getSelectedImageIds(e.target.value), isAttachDisabled: false });
        }
    }

    setUpdateCount(newCount) {
        this.updateCount = newCount;
    }

    setRef(ref) {
        if (!this.inputElem && ref) {
            this.inputElem = ref;
        }
    }

    getSelectedImageIds = (value) => {
        const bookable = this.getSelectedBookable(value);
        if (bookable && bookable.images && bookable.images.length > 0) {
            return bookable.images.map(image => image.id);
        }
        return [];
    }

    getImages = () => {
        const { isBookableImage, property, propertyUrl } = this.props;
        if (isBookableImage) {
            const bookable = this.getSelectedBookable(propertyUrl);
            if (bookable && bookable.images) {
                return bookable.images;
            }
            return [];
        } else if (isPanoTypeTab(this.state.selectedTab)) {
            return property.panoImages;
        } else if (isVideoTypeTab(this.state.selectedTab)) {
            return property.videos;
        }
        return property.images;
    }

    getSelectedBookable = (url) => {
        const id = idFromURLEnd(url);
        const bookables = this.props.property.bookables.filter(bookable => bookable.id === id);
        if (bookables.length > 0) {
            return bookables[0];
        }
        return null;
    }

    attachImagesToBookable() {
        const selectedImagesIds = this.getSelectedImageIds(this.inputElem.value);

        const imagesToAdd = this.imageIds.filter(id => selectedImagesIds.indexOf(id) < 0);
        const imagesToDelete = selectedImagesIds.filter(id => this.imageIds.indexOf(id) < 0);
        const bookable = this.getSelectedBookable(this.inputElem.value);

        this.images = bookable ? bookable.images : [];
        this.updateImageToBookable(imagesToAdd, true);
        this.updateImageToBookable(imagesToDelete);
    }

    updateImageToBookable(imageIds, addImage = false) {
        const { updatePropertyImage, imageType, property } = this.props;
        if (imageIds.length > 0) {
            this.updateCount = imageIds.length;
            for (let i = imageIds.length - 1; i >= 0; i -= 1) {
                const imageData = {
                    bookable_item: addImage ? this.inputElem.value : '',
                    property: addImage ? null : property.url
                };
                updatePropertyImage(imageData, imageIds[i], imageType).then((data) => {
                    if (addImage) {
                        this.images.push(data);
                    } else {
                        this.images = this.images.filter(image => image.id !== imageIds[i]);
                    }

                    this.counts.success += 1;
                    this.updateAttachedImages();
                }).catch((err) => {
                    this.counts.error += 1;
                    this.updateAttachedImages();
                    throw Error(err);
                });
            }
        }
    }

    isShowAddImages = () => this.props.view === viewOptions.ADD_IMAGES;
    isShowEditImages = () => this.props.view === viewOptions.EDIT_IMAGES;
    isShowAttachImages = () => this.props.view === viewOptions.ATTACH_IMAGES;

    updateView = (updatedImages) => {
        const { closeModal, isBookableImage, reloadImages, property } = this.props;
        if (isBookableImage) {
            const bookable = this.getSelectedBookable(this.props.propertyUrl);
            if (bookable) {
                bookable.images = updatedImages;
            }
        } else if (this.isShowAttachImages()) {
            const bookable = this.getSelectedBookable(this.inputElem.value);
            if (bookable) {
                bookable.images = updatedImages;
            }
        } else {
            property.images = updatedImages;
        }
        closeModal();
        reloadImages();
    }

    updateListingImages = () => {
        const { showMessageModal } = this.props;
        this.updateCount -= 1;
        if (this.updateCount === 0) {
            this.updateView(this.images);

            if (this.counts.success > 0) {
                showMessageModal(
                    'Message',
                    messages.PROPERTY_IMAGES_UPDATE_SUCCESS
                );
            } else {
                showMessageModal(
                    'Message',
                    messages.errors.PROPERTY_IMAGES_UPDATE
                );
            }
        }
    }

    updateAttachedImages = () => {
        const { showMessageModal } = this.props;
        this.updateCount -= 1;
        if (this.updateCount === 0) {
            this.updateView(this.images);

            if (this.counts.success > 0) {
                showMessageModal(
                    'Message',
                    messages.PROPERTY_IMAGES_UPDATE_SUCCESS
                );
            } else {
                showMessageModal(
                    'Message',
                    messages.errors.PROPERTY_IMAGES_UPDATE
                );
            }
        }
    }

    removeDeleteImagesFromList = (imageList, ids) =>
        imageList.filter(image => ids.indexOf(image.id) < 0);

    updateWithRemovedListingImages = () => {
        const { showMessageModal } = this.props;

        this.updateCount -= 1;
        if (this.updateCount === 0) {
            const updatedImageList = this.removeDeleteImagesFromList(this.getImages(), this.deletedImageIds);
            this.updateView(updatedImageList);

            if (this.counts.success > 0) {
                showMessageModal(
                    'Message',
                    messages.PROPERTY_IMAGES_DELETE_SUCCESS
                );
            } else {
                showMessageModal(
                    'Message',
                    messages.errors.PROPERTY_IMAGES_DELETE
                );
            }
        }
    }

    updateImage = (image, order) => {
        const { updatePropertyImage, imageType, isBookableImage, propertyUrl } = this.props;
        const imageData = {
            caption: image.caption,
            ordering: order
        };

        if (isBookableImage) {
            const bookable = this.getSelectedBookable(propertyUrl);
            if (bookable) {
                imageData.bookable_item = bookable.url;
            }
        } else {
            imageData.property = propertyUrl;
        }

        updatePropertyImage(imageData, image.id, imageType).then(() => {
            this.counts.success += 1;
            this.updateListingImages();
        }).catch((err) => {
            this.counts.error += 1;
            this.updateListingImages();
            throw Error(err);
        });
    }

    updateImages = () => {
        if (this.images.length > 0 && !this.state.isUpdating) {
            this.setState({ isUpdating: true });
            this.updateCount = this.images.length;

            const length = this.images.length;
            for (let i = 0; i < length; i += 1) {
                this.updateImage(this.images[i], i);
            }
        }
    }

    updateImageSequence = (updatedImages) => {
        this.images = updatedImages;
    }

    checkboxOnChange = (id, deleteFlag) => {
        const imageId = parseInt(id, 10);

        if (deleteFlag) {
            if (this.imageIds.indexOf(imageId) < 0) {
                this.imageIds.push(imageId);
            }
        } else if (this.imageIds.indexOf(imageId) > -1) {
            this.imageIds.splice(this.imageIds.indexOf(imageId), 1);
        }
    }

    deleteSelectedImage = (id) => {
        const { deletePropertyImage, imageType } = this.props;
        deletePropertyImage(id, imageType).then(() => {
            this.counts.success += 1;
            this.deletedImageIds.push(id);
            this.updateWithRemovedListingImages();
        }).catch((err) => {
            this.counts.error += 1;
            this.updateWithRemovedListingImages();
            throw Error(err);
        });
    }

    deleteSelected = () => {
        if (this.imageIds.length > 0 && !this.state.isUpdating) {
            this.setState({ isUpdating: true });

            this.updateCount = this.imageIds.length;

            const length = this.imageIds.length;
            for (let i = 0; i < length; i += 1) {
                this.deleteSelectedImage(this.imageIds[i]);
            }
        }
    }

    // Add Images

    updateAddedListingImages() {
        const { closeModal, showMessageModal } = this.props;
        const { isBookableImage, reloadImages, property, propertyUrl } = this.props;

        this.updateCount -= 1;
        if (this.updateCount === 0) {
            if (isBookableImage) {
                const bookable = this.getSelectedBookable(propertyUrl);
                if (bookable) {
                    bookable.images = bookable.images.concat(this.uploadedImages);
                }
            } else if (isPanoTypeTab(this.state.selectedTab)) {
                property.panoImages = property.panoImages.concat(this.uploadedImages);
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
        const { addPropertyImage, addPropertyPanoramaImage, imageType, isBookableImage, propertyUrl } = this.props;
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

        if (isPhotoTypeTab(this.state.selectedTab)) {
            addPropertyImage(imageData, property.id, imageType).then((data) => {
                this.uploadedImages.push(data);
                this.counts.success += 1;
                this.updateAddedListingImages();
            }).catch((err) => {
                this.counts.error += 1;
                this.updateAddedListingImages();
                throw Error(err);
            });
        } else if (isPanoTypeTab(this.state.selectedTab)) {
            addPropertyPanoramaImage(imageData).then((data) => {
                this.uploadedImages.push(data);
                this.counts.success += 1;
                this.updateAddedListingImages();
            }).catch((err) => {
                this.counts.error += 1;
                this.updateAddedListingImages();
                throw Error(err);
            });
        }
    }

    showVideoAlert(success) {
        const { reloadImages, showMessageModal, closeModal } = this.props;
        if (success) {
            showMessageModal(
                'Message',
                messages.PROPERTY_VIDEO_ADD_SUCCESS
            );
        } else {
            showMessageModal(
                'Message',
                messages.errors.PROPERTY_VIDEO_ADD
            );
        }
        closeModal();
        reloadImages();
    }

    addYoutubeVideo(video) {
        const { addPropertyVideo, propertyUrl } = this.props;
        const { property } = this.props;
        const imageData = Object.assign(video, {
            property: propertyUrl,
            ordering: this.getImages().length
        });

        addPropertyVideo(imageData).then((data) => {
            if (!property.videos) {
                property.videos = [];
            }
            property.videos.push(data);
            this.showVideoAlert(true);
        }).catch((err) => {
            this.showVideoAlert(false);
            throw Error(err);
        });
    }

    submit() {
        if (isVideoTypeTab(this.state.selectedTab)) {
            if (this.video.external_video_link) {
                this.setState({ isUpdating: true });
                this.updateCount += 1;
                this.addYoutubeVideo(this.video);
            }
        } else if (this.images.length > 0 && !this.state.isUpdating) {
            this.setState({ isUpdating: true });
            this.updateCount = this.images.length;
            const length = this.updateCount;
            for (let i = 0; i < length; i += 1) {
                this.uploadImage(this.images[i], i);
            }
        }
    }

    pushImageFile(image, order) {
        if (isMobileDevice()) {
            this.setState({ isUpdating: true });
            this.uploadImage(image, order);
        } else {
            this.images.push(image);
        }
    }

    resetImageFiles() {
        this.images = [];
    }
    // Add Images

    render() {
        const { isBookableImage, property } = this.props;
        const isAddForm = this.isShowAddImages();
        const isImagesTab = isPhotoTypeTab(this.state.selectedTab) || isPanoTypeTab(this.state.selectedTab);
        const buttons = () => {
            if (isAddForm) {
                return (
                    <div className="cf">
                        <Button className="fl w-100 bg-near-white tc Button bg-red br0" onClick={this.submit}>
                            Submit
                        </Button>
                    </div>
                );
            } else if (this.isShowAttachImages()) {
                return (
                    <div className="cf">
                        <Button
                          className="fl w-100 bg-near-white tc Button bg-red br0"
                          onClick={this.attachImagesToBookable}
                          disabled={this.state.isAttachDisabled}
                        >
                            Update
                        </Button>
                    </div>
                );
            }
            return (
                <div className="cf">
                    <Button className="fl w-50 bg-near-white tc Button bg-red br0" onClick={this.deleteSelected}>
                        Delete
                    </Button>
                    <Button className="fl w-50 bg-near-white tc Button bg-blue br0" onClick={this.updateImages}>
                        Update <span className="hide-text-xs"> Photos</span>
                    </Button>
                </div>
            );
        };

        const addComponent = () => (
            isAddForm && isImagesTab ? (
                <PropertyImagesField
                  submitOnChange
                  extralarge
                  onSubmit={this.submit}
                  addImageFile={this.pushImageFile}
                  resetImageFiles={this.resetImageFiles}
                  setUpdateCount={this.setUpdateCount}
                />
            ) : null
        );

        const getTabKlass = name => this.state.selectedTab === name ? 'bg-red' : 'bg-light-red';

        const propertyTabs = () => (
            <div className="dt dt--fixed ma2 absolute">
                {
                    TABS.order.map(key => (
                        <div
                          className={cls('dtc tc pa1 pointer white', getTabKlass(key))}
                          onClick={() => this.onTabClick(key)}
                          key={key}
                          role="presentation"
                        >
                            {TABS[key]}
                        </div>
                    ))
                }
            </div>
        );

        const bookableDropDown = () => (
            <div className="dt dt--fixed mh2 mb2 absolute pl1 pr4">
                <select
                  className="ChangeBookable-select small-12 medium-6 fl pr4"
                  ref={(ref) => { this.setRef(ref); }}
                  onChange={e => this.onChangeBookable(e)}
                >
                    <option value="" key="0">Select a Bookable</option>
                    {
                        property.bookables.map(({ id, caption, url }) => (
                            <option value={url} key={id}>
                                {caption}
                            </option>
                        ))
                    }
                </select>
            </div>
        );

        return (
            <div className="h-100 relative">
                { this.state.isUpdating &&
                    (
                        <div className="loading-anim small-centered small-12 absolute show-for-small h-100">
                            <Spinner />
                        </div>
                    )
                }
                {
                    !isBookableImage && isAddForm && propertyTabs()
                }
                {
                    this.isShowAttachImages() && bookableDropDown()
                }
                <div
                  className="h-100 show-for-small"
                  style={{ paddingBottom: '42px', paddingTop: (isBookableImage || this.isShowEditImages() ? '0px' : '42px') }}
                >
                    {
                        <LazyLoad height="480px">
                            <SortableImages
                              images={this.getImages()}
                              updateImageSequence={this.updateImageSequence}
                              checkboxOnChange={this.checkboxOnChange}
                              isDisabled={isAddForm || this.isShowAttachImages()}
                              showInput={!isAddForm}
                              addComponent={addComponent()}
                              type={this.state.selectedTab}
                              selectedIds={this.state.selectedImagesIds}
                            />
                        </LazyLoad>
                    }
                    <div className="pb-10 shadow-top-lb-box pv1 relative z-9999">
                        {
                            isVideoTypeTab(this.state.selectedTab) &&
                            <div className="w-100 bottom-0 right-0 left-0 absolute bg-white" style={{ height: '95px' }}>
                                <div className="fl mb5 pa1" style={{ height: '70px', width: '70px' }}>
                                    <img className="ma1" src={this.state.videoImageUrl} alt="Video" />
                                </div>
                                <div className="fl w-50">
                                    <input
                                      className="mv2 ml1 tl pa1"
                                      onChange={this.onYoutubeUrlChange}
                                      placeholder="Youtube URL"
                                    />
                                    <input
                                      className="ma1 tl pa1"
                                      onChange={this.onVideoCaptionChange}
                                      placeholder="Caption"
                                    />
                                </div>
                            </div>
                        }
                        <div className="small-12 column text-right relative">
                            {buttons()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

EditImagesForm.propTypes = {
    property: eventPropertyType.isRequired,
    updatePropertyImage: PropTypes.func.isRequired,
    deletePropertyImage: PropTypes.func.isRequired,
    showMessageModal: PropTypes.func.isRequired,
    closeModal: PropTypes.func.isRequired,
    isBookableImage: PropTypes.bool.isRequired,
    propertyUrl: PropTypes.string.isRequired,
    imageType: PropTypes.string.isRequired,
    reloadImages: PropTypes.func.isRequired,
    addPropertyImage: PropTypes.func.isRequired,
    addPropertyPanoramaImage: PropTypes.func.isRequired,
    addPropertyVideo: PropTypes.func.isRequired,
    view: PropTypes.string.isRequired
};

export default reduxForm({
    form: 'edit-property-image'
})(EditImagesForm);
