import React, { PropTypes } from 'react';

import PhotoIcon from '../../Icons/PhotoIcon.jsx';
import PanoIcon from '../../Icons/PanoIcon.jsx';
import VideoIcon from '../../Icons/VideoIcon.jsx';

import getYoutubeVideoId from '../../../lib/getYoutubeVideoId.js';

import { eventPropertyType } from '../../../data-shapes/property.js';

const getVideoPreviewImg = (src) => {
    const ytid = getYoutubeVideoId(src || '');
    return `https://img.youtube.com/vi/${ytid}/hqdefault.jpg`;
};

class CarouselSwitcher extends React.Component {
    static propTypes = {
        property: eventPropertyType,
        onSlideTypeChange: PropTypes.func.isRequired,
        inlineSwitcher: PropTypes.bool.isRequired
    }

    static defaultProps = {
        property: {},
        inlineSwitcher: false
    }

    constructor(props) {
        super(props);
        this.setDefaultSlideType = this.setDefaultSlideType.bind(this);
        this.isShowing = this.isShowing.bind(this);
        this.changeSlideType = this.changeSlideType.bind(this);

        this.state = { slideType: 'images' };
    }

    componentWillReceiveProps() {
        this.setDefaultSlideType();
    }

    setDefaultSlideType() {
        const { property } = this.props;
        if (property.images.length || this.state.slideType !== 'images') {
            return;
        }

        let slideType;

        if (property.panoImages.length) {
            slideType = 'panoImages';
        } else {
            slideType = 'videos';
        }

        this.setState({ slideType });
    }

    changeSlideType(slideType) {
        this.setState({ slideType });
        const { onSlideTypeChange } = this.props;
        onSlideTypeChange(slideType);

        document.getElementById('MultiCarousel').scrollIntoView({ // eslint-disable-line no-undef
            behaviour: 'smooth'
        });
    }

    isShowing(type) {
        const { slideType } = this.state;
        return slideType === type;
    }

    render() {
        const { property, inlineSwitcher } = this.props;

        if (inlineSwitcher) {
            return (
                <div className="pa1 bg-white-50 absolute top-1 right-1 shadow-1">
                    { !!property.images.length && !this.isShowing('images') && <div
                      className="h2 w2"
                      onClick={() => this.changeSlideType('images')}
                    >
                        <PhotoIcon bgColor="rgba(255, 255, 255, 0.5)" />
                    </div> }
                    { !!property.videos.length && !this.isShowing('videos') && <div
                      className="w2 h2"
                      onClick={() => this.changeSlideType('videos')}
                    >
                        <VideoIcon bgColor="#bb0000" />
                    </div> }
                    { !!property.panoImages.length && !this.isShowing('panoImages') && <div
                      className="w2 h2"
                      onClick={() => this.changeSlideType('panoImages')}
                    >
                        <PanoIcon bgColor="rgba(255, 255, 255, 0.5)" />
                    </div> }
                </div>
            );
        }

        const svgButton = ({ type, icon, img, alt }) => (
            <div
              className="dib w-50 bg-light-gray pa1 relative h4"
              onClick={() => { this.changeSlideType(type); }}
            >
                <img
                  className="h-100 w-100 v-base"
                  src={img}
                  alt={alt}
                />
                <div className="absolute w-20 h-20" style={{ top: '30%', right: '40%' }}>
                    {icon}
                </div>
            </div>
        );

        const imageSelector = svgButton({
            type: 'images',
            icon: <PhotoIcon bgColor="rgba(255, 255, 255, 0.5)" />,
            img: property.images[0] && (property.images[0].small || property.images[0].fallbackImage),
            alt: 'Show images'
        });

        const panoImageSelector = svgButton({
            type: 'panoImages',
            icon: <PanoIcon bgColor="rgba(255, 255, 255, 0.5)" />,
            img: property.panoImages[0] && property.panoImages[0].image,
            alt: 'Show 360° images'
        });

        const videoSelector = svgButton({
            type: 'videos',
            icon: <VideoIcon bgColor="#bb0000" />,
            img: property.videos[0] && getVideoPreviewImg(property.videos[0].url),
            alt: 'Show videos'
        });

        return (
            <div className="h4 fl w-100 w-two-thirds-ns mb3">
                {!!property.images.length && !this.isShowing('images') && imageSelector}
                {!!property.panoImages.length && !this.isShowing('panoImages') && panoImageSelector}
                {!!property.videos.length && !this.isShowing('videos') && videoSelector}
            </div>
        );
    }
}

export default CarouselSwitcher;
