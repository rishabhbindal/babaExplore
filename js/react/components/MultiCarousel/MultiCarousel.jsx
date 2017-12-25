import React, { PropTypes } from 'react';
import cls from 'classnames';
import LazyLoad from 'react-lazyload';

import PanoImageModal from '../PanoImageModal/PanoImageModal.jsx';
import ELTSlider from '../ELTSlider/ELTSlider.jsx';

import { eventPropertyType } from '../../data-shapes/property.js';

import './MultiCarousel.scss';

import OpenPanoIcon from '../Icons/OpenPanoIcon.jsx';
import FullScreenIcon from '../Icons/FullScreen.jsx';
import YouTubeLazy from '../YouTubeLazy/YouTubeLazy.jsx';
import FullScreenCarousel from '../FullScreenCarousel/FullScreenCarousel.jsx';

const loadImg = (img, size) => {
    const image = new Image(); // eslint-disable-line no-undef
    image.src = img[size] || img.medium || img.large || img.fallbackImage;
};

class MultiCarousel extends React.Component {
    static propTypes = {
        property: eventPropertyType,
        slideType: PropTypes.string
    }

    static defaultProps = {
        property: {},
        slideType: 'images'
    }

    constructor(props) {
        super(props);
        this.showPano = this.showPano.bind(this);
        this.closePano = this.closePano.bind(this);
        this.setDefaultSlideType = this.setDefaultSlideType.bind(this);
        this.showFullCarousel = this.showFullCarousel.bind(this);
        this.getImageSliderRef = this.getImageSliderRef.bind(this);
        this.loadNextTwo = this.loadNextTwo.bind(this);
        this.setImageSize = this.setImageSize.bind(this);

        this.state = { slideType: 'images', fullScrImage: {} };
    }

    componentDidMount() {
        this.setImageSize();
        window.addEventListener('orientationchange', this.setImageSize); // eslint-disable-line no-undef

        const { property: { images } } = this.props;
        if (images && images.length) {
            images.slice(0, 2).forEach(img => loadImg(img, this.imgSize));
        }
    }

    componentWillReceiveProps() {
        this.setDefaultSlideType();
    }

    componentWillUnmount() {
        window.removeEventListener('orientationchange', this.setImageSize); // eslint-disable-line no-undef
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

    closePano() {
        this.setState({ showPano: false, panoSrc: null });
    }

    showPano(panoSrc) {
        this.setState({ panoSrc, showPano: true });
    }

    showFullCarousel(images, idx) {
        if (!images) {
            this.setState({ fullScrImage: {} });
            return;
        }

        this.setState({
            fullScrImage: {
                show: true,
                images,
                idx
            }
        });
    }

    getImageSliderRef(ref) {
        this.imageSliderRef = ref;
    }

    setImageSize() {
        this.imgSize = window.matchMedia('(max-width: 30rem)').matches // eslint-disable-line no-undef
             ? 'small' : 'medium';
    }

    loadNextTwo(idx) {
        const { property: { images } } = this.props;
        const nextImgs = images.slice(idx + 1, idx + 3);
        // eagerly load next two images
        nextImgs.forEach(nxt => loadImg(nxt, this.imgSize));
    }

    render() {
        const { property, slideType } = this.props;
        if (!property.images.length && !property.panoImages.length && !property.videos.length) {
            return false;
        }

        const imageSlides = property.images.map((img, idx) => (
            <div style={{ position: 'relative' }} key={img.fallbackImage} >
                <img
                  src={img.small}
                  srcSet={`${img.small || img.fallbackImage} 640w, ${img.medium || img.fallbackImage} 960w`}
                  sizes="(max-width: 30rem) 100vw, (min-width: 31rem) 70vw"
                  alt={img.caption}
                />
                <span
                  style={{
                      position: 'absolute',
                      left: '1rem',
                      top: '1rem'
                  }}
                  className="bg-light-gray h2 w2 shadow-1"
                  onClick={() => this.showFullCarousel(property.images, idx)}
                >
                    <FullScreenIcon />
                </span>
            </div>
        ));

        const videoSlides = property.videos.map(video => (
            <div key={video.url}>
                <YouTubeLazy url={video.url} />
            </div>
        ));

        const panoImageSlides = property.panoImages.map(img => (
            <div key={img.id}>
                <div style={{ position: 'relative' }}>
                    <span className="MultiCarousel__panorama__icon light-gray" onClick={() => { this.showPano(img.image); }}>
                        <OpenPanoIcon />
                        <h6>View 360˚</h6>
                    </span>
                    <LazyLoad>
                        <img
                          alt={img.caption}
                          src={img.image}
                        />
                    </LazyLoad>
                </div>
            </div>
        ));

        const isShowing = type => slideType === type;

        const imageSliderSettings = {
            afterChange: this.loadNextTwo,
            dots: true,
            infinite: false,
            lazyLoad: true,
            speed: 300,
            slidesToShow: 1,
            slidesToScroll: 1
        };

        return (
            <div style={{ position: 'relative' }} id="MultiCarousel">
                { !!imageSlides.length && isShowing('images') && <ELTSlider
                  getRef={this.getImageSliderRef}
                  settings={imageSliderSettings}
                >
                    {imageSlides}</ELTSlider> }
                { !!videoSlides.length && isShowing('videos') && <ELTSlider>{videoSlides}</ELTSlider> }
                { !!panoImageSlides.length && isShowing('panoImages') && <ELTSlider>{panoImageSlides}</ELTSlider> }
                {this.state.showPano && <PanoImageModal
                  src={this.state.panoSrc}
                  showPano={this.state.showPano}
                  closePano={this.closePano}
                /> }
                { this.state.fullScrImage.show && <FullScreenCarousel
                  isOpen={this.state.fullScrImage.show}
                  closeModal={() => this.showFullCarousel()}
                  images={this.state.fullScrImage.images}
                  idx={this.state.fullScrImage.idx}
                  parentSlider={this.imageSliderRef}
                /> }
            </div>
        );
    }
}

export default MultiCarousel;
