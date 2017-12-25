import React, { Component, PropTypes } from 'react';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import isMobileDevice from '../../../lib/isMobileDevice.js';
// import { imageSetPropType } from '../../../data-shapes/property.js';

import './SortableImages.scss';
import SelectCheckBox from '../SelectCheckBox.jsx';
import { youtubeImageHqUrl } from '../../../lib/youtubeHelper.js';

const TAB_ORDER = ['photos', 'panorama', 'video'];

const photoType = image => (
    <div className="aspect-ratio aspect-ratio--16x9">
        <img alt="" src={image.small} className="db bg-center cover aspect-ratio--object" />
    </div>
);

const panoramaType = image => (
    <div className="aspect-ratio aspect-ratio--16x9">
        <img alt="" src={image.image} className="db bg-center cover aspect-ratio--object" />
    </div>
);

const videoType = image => (
    <div className="aspect-ratio aspect-ratio--16x9">
        <img alt="" src={youtubeImageHqUrl(image.url)} className="db bg-center cover aspect-ratio--object" />
    </div>
);

const isImageSelected = (image, selectedIds) => selectedIds.indexOf(image.id) > -1;

const getSortableItemContent = (image, type) => {
    if (type === TAB_ORDER[1]) {
        return panoramaType(image);
    } else if (type === TAB_ORDER[2]) {
        return videoType(image);
    }
    return photoType(image);
};

const SortableItem = SortableElement(({ image, inputOnChange, showInput, addComponent, type, isChecked }) => (
    <div className="fl w-50 w-third-m w-25-ns pa2" style={{ zIndex: 1000 }}>
        {
            image ? (
                <div className="relative">
                    {getSortableItemContent(image, type)}
                    {
                        showInput &&
                        <SelectCheckBox value={image.id} onChange={inputOnChange} isChecked={isChecked} />
                    }
                </div>
            )
            : (
                addComponent
            )
        }
    </div>
));


const SortableList = SortableContainer(({ images, inputOnChange, isDisabled, showInput, addComponent, type, selectedIds }) => (
    <div className="SortableImages ma0 pa1-ns overflow-container" style={{ height: '100%' }}>
        {images.map((image, index) => (
            <SortableItem
              key={`item-${image.id}`}
              index={index}
              image={image}
              inputOnChange={inputOnChange}
              disabled={isDisabled}
              showInput={showInput}
              type={type}
              isChecked={isImageSelected(image, selectedIds)}
            />
        ))}
        <SortableItem
          key="item-0"
          index={images.length}
          disabled
          addComponent={addComponent}
        />
    </div>
));

class SortableImages extends Component {
    static propTypes = {
        // images: PropTypes.arrayOf(imageSetPropType).isRequired,
        updateImageSequence: PropTypes.func.isRequired,
        checkboxOnChange: PropTypes.func.isRequired,
        type: PropTypes.string,
        isDisabled: PropTypes.bool,
        showInput: PropTypes.bool
    };

    constructor(props) {
        super(props);
        this.state = {
            images: props.images,
            selectedIds: props.selectedIds
        };
    }

    componentWillReceiveProps(nextProps) {
        const { images, selectedIds } = nextProps;
        this.setState({ images, selectedIds });
    }

    onSortEnd = ({ oldIndex, newIndex }) => {
        const { updateImageSequence } = this.props;
        this.setState({
            images: arrayMove(this.state.images, oldIndex, newIndex)
        });
        updateImageSequence(this.state.images);
    };

    inputOnChange = (e) => {
        const { checkboxOnChange } = this.props;
        checkboxOnChange(e.target.value, e.target.checked);
    };

    render() {
        const { isDisabled, addComponent, type, showInput } = this.props;
        return (
            <SortableList
              images={this.state.images}
              onSortEnd={this.onSortEnd}
              axis="xy"
              inputOnChange={this.inputOnChange}
              isDisabled={isDisabled}
              showInput={showInput}
              addComponent={addComponent}
              pressDelay={isMobileDevice() ? 200 : 0}
              type={type}
              selectedIds={this.state.selectedIds}
            />
        );
    }
}

SortableImages.defaultProps = {
    isDisabled: false,
    showInput: false,
    type: 'photos'
};

export default SortableImages;
