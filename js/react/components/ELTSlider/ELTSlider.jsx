import cls from 'classnames';
import React, { PropTypes } from 'react';
import Slider from 'react-slick';

/**
 * Styles copied from slick-carousel.
 */
import './slick.scss';
import './slick-theme.scss';
import './ELTSlider.scss';

class ELTSlider extends React.Component {
    static propTypes = {
        children: PropTypes.node.isRequired,
        getRef: PropTypes.func
    }

    static defaultProps = {
        getRef: () => {}
    }

    static defaultSettings = {
        dots: true,
        infinite: false,
        lazyLoad: true,
        speed: 300,
        slidesToShow: 1,
        slidesToScroll: 1
    }

    render() {
        const { children, settings, dotsOnLeft, getRef } = this.props;
        const klass = cls('ELTSlider', { 'ELTSlider__dots--center': !dotsOnLeft });

        /**
         * If not browser, Slider is not helpful or functional. Return
         * the first child, instead of listing all the entries.
         */
        if (process.env.ELT_IS_NOT_BROWSER === 'true' && children.length) {
            return children[0];
        }

        return (
            <Slider
              ref={getRef}
              className={klass}
              {...(settings || ELTSlider.defaultSettings)}
            >
                {children}
            </Slider>
        );
    }
}

export default ELTSlider;
