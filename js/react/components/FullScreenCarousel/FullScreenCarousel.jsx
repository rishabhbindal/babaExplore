import React, { PropTypes } from 'react';

import { imageSetPropType } from '../../data-shapes/image.js';

import Modal from '../Modal/Modal.jsx';
import MinimiseIcon from '../Icons/Minimise.jsx';

import './FullScreenCarousel.scss';

class FullScreenCarousel extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool,
        images: PropTypes.arrayOf(imageSetPropType),
        idx: PropTypes.number,
        closeModal: PropTypes.func.isRequired
    }

    static defaultProps = {
        isOpen: false,
        images: [],
        idx: 0
    }

    constructor(props) {
        super(props);

        this.nextImage = this.nextImage.bind(this);
        this.prevImage = this.prevImage.bind(this);

        const { idx, images } = props;
        this.state = { idx, length: images.length };
    }

    nextImage() {
        const { parentSlider } = this.props;
        const { idx, length } = this.state;
        if (idx === (length - 1)) {
            return;
        }
        this.setState({ idx: (idx + 1) });
        if (parentSlider) {
            parentSlider.slickNext();
        }
    }

    prevImage() {
        const { parentSlider } = this.props;
        const { idx } = this.state;
        if (!idx) {
            return;
        }
        this.setState({ idx: idx - 1 });
        if (parentSlider) {
            parentSlider.slickPrev();
        }
    }

    render() {
        const { isOpen, images } = this.props;
        const { idx, length } = this.state;
        const { closeModal } = this.props;

        if (!images.length) {
            return null;
        }

        const btnClass = 'absolute h2 w2 bg-near-white pa1 br4 b black-70 FullScreenCarousel__controls';

        return (
            <Modal
              isOpen={true && isOpen}
              closeModal={closeModal}
              klassName="FullScreen-image-modal"
            >
                <div className="tc pt4 pt0-ns" style={{ minHeight: '60vh' }}>
                    <h4 className="dib ma2">{images[idx].caption}</h4>
                    <span
                      className="fr ma2 h2 w2 dn db-ns"
                      onClick={closeModal}
                    >
                        <MinimiseIcon />
                    </span>
                    <img
                      className="FullScreenCarousel__image"
                      key={images[idx].fallbackImage}
                      src={images[idx].medium || images[idx].large || images[idx].fallbackImage}
                      alt={images[idx].caption}
                    />
                    { idx !== 0 && <div
                      className={btnClass}
                      style={{ left: '0' }}
                      onClick={this.prevImage}
                    > &lt; </div> }
                    { idx !== (length - 1) && <div
                      className={btnClass}
                      style={{ right: '0' }}
                      onClick={this.nextImage}
                    > &gt; </div> }
                </div>
            </Modal>
        );
    }
}

export default FullScreenCarousel;
