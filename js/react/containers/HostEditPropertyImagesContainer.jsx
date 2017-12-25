import React, { PropTypes } from 'react';

import { viewOptions } from '../constants/images.js';
import EditOptionsView from '../components/PropertyImages/EditOptionsView/EditOptionsView.jsx';
import EditPropertyImagesModal from '../components/PropertyImages/EditPropertyImagesModal/EditPropertyImagesModal.jsx';

class HostEditPropertyImagesContainer extends React.Component {
    static propTypes = {
        isSmall: PropTypes.bool,
        isBookableImage: PropTypes.bool,
        rearrangeIndex: PropTypes.func
    };

    static defaultProps = {
        isSmall: false,
        isBookableImage: false,
        rearrangeIndex: () => {}
    };

    constructor(props) {
        super(props);

        this.closeModal = this.closeModal.bind(this);
        this.isOpen = this.isOpen.bind(this);
        this.onAddPhotosClicked = this.onAddPhotosClicked.bind(this);
        this.onDeleteRearrangePhotosClicked = this.onDeleteRearrangePhotosClicked.bind(this);
        this.onAttachToBookableItemClicked = this.onAttachToBookableItemClicked.bind(this);

        this.state = {};
        this.state.isOpen = false;
        this.state.view = viewOptions.EDIT_OPTIONS;
    }

    onAddPhotosClicked() {
        this.setState({ view: viewOptions.ADD_IMAGES, isOpen: true });
        this.props.rearrangeIndex(true);
    }

    onDeleteRearrangePhotosClicked() {
        this.setState({ view: viewOptions.EDIT_IMAGES, isOpen: true });
        this.props.rearrangeIndex(true);
    }

    onAttachToBookableItemClicked() {
        this.setState({ view: viewOptions.ATTACH_IMAGES, isOpen: true });
        this.props.rearrangeIndex(true);
    }

    closeModal() {
        this.setState({ isOpen: false });
        this.props.rearrangeIndex(false);
    }

    isOpen() {
        return this.state.isOpen;
    }

    render() {
        const { isSmall, isBookableImage } = this.props;
        return (
            <div className="absolute w-100 h-100 top-0">
                {
                    this.state.isOpen &&
                    <EditPropertyImagesModal
                      {...this.props}
                      isOpen={this.isOpen}
                      closeModal={this.closeModal}
                      view={this.state.view}
                    />
                }
                <EditOptionsView
                  onAddPhotosClicked={this.onAddPhotosClicked}
                  onDeleteRearrangePhotosClicked={this.onDeleteRearrangePhotosClicked}
                  onAttachToBookableItemClicked={this.onAttachToBookableItemClicked}
                  isBookableImage={isBookableImage}
                  isSmall={isSmall}
                />
            </div>
        );
    }
}

export default HostEditPropertyImagesContainer;
