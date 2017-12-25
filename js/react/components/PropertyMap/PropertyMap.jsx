import React, { PropTypes } from 'react';
import GoogleMapReact from 'google-map-react';
import { meters2ScreenPixels } from 'google-map-react/utils';

import EditMap from '../EditProperty/EditMap.jsx';
import './PropertyMap.scss';
import GoogleMapScriptLoader from '../GoogleMapScriptLoader.jsx';
import IsNotDisplayNone from '../IsNotDisplayNone.jsx';
import { eventPropertyType } from '../../data-shapes/property.js';
import LightBox from '../LightBox/LightBox.jsx';

const Circle = ({ text, radius }) => (
    <div
      className="PropertyMap__circle"
      style={{
          width: radius,
          height: radius,
          left: -radius / 2,
          top: -radius / 2,
          borderRadius: radius
      }}
    />
);

class PropertyMap extends React.Component {
    static propTypes = {
        position: PropTypes.shape({
            longitude: PropTypes.number,
            latitude: PropTypes.number
        }),
        label: PropTypes.string,
        isEditable: PropTypes.func,
        property: eventPropertyType,
        updateLocation: PropTypes.func
    }

    constructor(props) {
        super(props);
        const { latitude, longitude } = props.position;

        this.onChange = this.onChange.bind(this);
        this.showEditmap = this.showEditmap.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.onLocationChange = this.onLocationChange.bind(this);

        this.state = {
            zoom: 15,
            radius: 40,
            showEditmap: false
        };
        this.location = { latitude, longitude };
    }

    componentWillMount() {
        this.onChange({ zoom: this.state.zoom });
    }

    componentWillReceiveProps(nextProps) {
        const { latitude, longitude } = nextProps.position;
        if (this.location.latitude !== latitude || this.location.longitude !== longitude) {
            this.location = { latitude, longitude };
        }
    }


    onChange({ zoom }) {
        const { latitude, longitude } = this.props.position;

        const radiusInMeters = 500;
        const { w, h } = meters2ScreenPixels(radiusInMeters, {
            lat: latitude,
            lng: longitude
        }, zoom);

        const radius = Math.ceil(Math.max(w, h));

        this.setState({ zoom, radius });
    }

    onLocationChange({ latitude, longitude }) {
        const { updateLocation } = this.props;
        this.location.latitude = latitude;
        this.location.longitude = longitude;
        updateLocation({ latitude, longitude });
    }

    showEditmap() {
        this.setState({ showEditmap: true });
    }

    closeModal() {
        this.setState({ showEditmap: false });
    }

    render() {
        const { position, label, isEditable, property } = this.props;

        if (!position) {
            return null;
        }

        if (process.env.ELT_IS_NOT_BROWSER === 'true') {
            return (
                <img
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${position.latitude},${position.longitude}&zoom=${this.state.zoom}&size=400x400&key=${process.env.ELT_MAP_API_KEY}`}
                  alt=""
                />
            );
        }

        return (
            <div className="h-100">
                {
                    isEditable() &&
                    <div
                      className="absolute w-100 h-100 z-1 bg-black-60 pb4"
                      onClick={this.showEditmap}
                      role="presentation"
                    >
                        <div className="pa2 ma2 ba white b--white h-100 flex justify-center items-end">
                            <div className="pa2 text-center">
                                <svg
                                  version="1.1"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 32 32"
                                  className="db"
                                  style={{ width: '50px', margin: 'auto' }}
                                >
                                    <title>camera</title>
                                    <path fill="#fff" d="M12 0c-5.512 0-10 4.488-10 10 0 1.769 0.513 3.606 1.531 5.463 0.787 1.444 1.881 2.906 3.244 4.35 2.3 2.431 4.575 3.956 4.669 4.019 0.169 0.113 0.363 0.169 0.556 0.169s0.387-0.056 0.556-0.169c0.094-0.063 2.369-1.587 4.669-4.019 1.369-1.444 2.456-2.906 3.244-4.35 1.012-1.856 1.531-3.7 1.531-5.463 0-5.512-4.488-10-10-10zM12 21.769c-1.9-1.406-8-6.356-8-11.769 0-4.413 3.588-8 8-8s8 3.588 8 8c0 5.412-6.106 10.362-8 11.769z" />
                                    <path fill="#fff" d="M12 6c-2.206 0-4 1.794-4 4s1.794 4 4 4c2.206 0 4-1.794 4-4s-1.794-4-4-4zM12 12c-1.1 0-2-0.9-2-2s0.9-2 2-2c1.1 0 2 0.9 2 2s-0.9 2-2 2z" />
                                </svg>
                                Repin your location
                            </div>
                        </div>
                    </div>
                }
                {
                    this.state.showEditmap &&
                    <LightBox
                      isOpen
                      closeModal={this.closeModal}
                    >
                        <EditMap
                          latitude={this.location.latitude}
                          longitude={this.location.longitude}
                          zoom={this.state.zoom}
                          closeModal={this.closeModal}
                          updateLocation={this.onLocationChange}
                        />
                    </LightBox>
                }
                <IsNotDisplayNone className="w-100 h-100">
                    <GoogleMapScriptLoader>
                        <GoogleMapReact
                          onChange={this.onChange}
                          center={[position.latitude, position.longitude]}
                          zoom={this.state.zoom}
                          options={{ scrollwheel: false }}
                          resetBoundsOnResize
                        >
                            <Circle
                              radius={this.state.radius}
                              lat={position.latitude}
                              lng={position.longitude}
                              text={label}
                            />
                        </GoogleMapReact>
                    </GoogleMapScriptLoader>
                </IsNotDisplayNone>
            </div>

        );
    }
}

export default PropertyMap;
