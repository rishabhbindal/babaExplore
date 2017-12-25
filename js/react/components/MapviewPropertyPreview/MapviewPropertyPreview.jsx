import React, { PropTypes } from 'react';
import cls from 'classnames';

import { eventPropertyType } from '../../data-shapes/property.js';
import isMobileDevice from '../../lib/isMobileDevice.js';

import './MapviewPropertyPreview.scss';

const renderForMobile = isMobileDevice();


class MapviewPropertyPreview extends React.Component {
    constructor(props) {
        super(props);
        this.setStyle = this.setStyle.bind(this);
        this.state = {};
    }

    componentWillReceiveProps(nextProps) {
        // reset state when hover is removed
        const hoverRemoved = !renderForMobile ? !nextProps.$hover && this.props.$hover :
            !nextProps.prop.persistInfoWindow && this.props.prop.persistInfoWindow;
        if (hoverRemoved) {
            this.setState({ touchesBottomEdge: false, touchesRightEdge: false });
        }
    }

    setStyle(ref) {
        if (!ref) {
            return;
        }
        const selfBounds = ref.getBoundingClientRect();
        /* eslint-disable no-undef */
        const parentBounds = document.querySelector('.MapView__container').getBoundingClientRect();
        /* eslint-enable no-undef */
        if (Math.abs(parentBounds.left - selfBounds.left) > Math.abs(parentBounds.right - selfBounds.left)) {
            this.setState({ touchesRightEdge: true });
        }
        if (Math.abs(parentBounds.top - selfBounds.top) > Math.abs(parentBounds.bottom - selfBounds.top)) {
            this.setState({ touchesBottomEdge: true });
        }
    }

    render() {
        const { prop, $hover } = this.props;
        const { setInfoWindowPersist } = this.props;
        const price = prop.dailyPrice ? `₹${prop.dailyPrice}` : 'Free';

        const desktopPreview = (
            <div>
                <a
                  className={cls('MapView__property__price',
                      $hover && 'MapView__property__price-hover'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`/listing/${prop.code}/`}
                >
                    { price }
                </a>
                { $hover && <a
                  className={cls('MapView__property__preview',
                        this.state.touchesBottomEdge && 'MapView__property__preview--up',
                        this.state.touchesRightEdge && 'MapView__property__preview--left'
                    )}
                  ref={this.setStyle}
                >
                    <img
                      className="MapView__property__preview__image"
                      src={(prop.image && (prop.image.medium || prop.image.fallbackImage)) || ''}
                      alt={prop.image.caption}
                    />
                    <p className="MapView__property__preview__caption">{prop.caption}</p>
                </a>
                }
            </div>
        );

        const mobilePreview = (
            <div>
                <div
                  className={cls('MapView__property__price MapView__property__price-mobile',
                      prop.persistInfoWindow && 'MapView__property__price-hover'
                  )}
                  onClick={() => { setInfoWindowPersist(prop.url); }}
                >
                    { price }
                </div>

                { prop.persistInfoWindow && <a
                  className={cls('MapView__property__preview',
                        this.state.touchesBottomEdge && 'MapView__property__preview--up',
                        this.state.touchesRightEdge && 'MapView__property__preview--left'
                    )}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`/listing/${prop.code}/`}
                  ref={this.setStyle}
                >
                    <img
                      className="MapView__property__preview__image"
                      src={(prop.image && (prop.image.medium || prop.image.fallbackImage)) || ''}
                      alt={prop.image.caption}
                    />
                    <p className="MapView__property__preview__caption">{prop.caption}</p>
                </a>
                }
            </div>
        );

        return renderForMobile ? mobilePreview : desktopPreview;
    }
}

MapviewPropertyPreview.defaultProps = {
    $hover: false
};

MapviewPropertyPreview.propTypes = {
    prop: eventPropertyType.isRequired,
    $hover: PropTypes.bool,
    setInfoWindowPersist: PropTypes.func.isRequired
};

export default MapviewPropertyPreview;
