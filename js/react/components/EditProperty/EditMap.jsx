import React, { PropTypes } from 'react';
import { withGoogleMap, GoogleMap, Marker, InfoWindow } from 'react-google-maps';
import SearchBox from 'react-google-maps/lib/places/SearchBox';

import Loader from '../Loader/Loader.jsx';
import Button from '../Button/Button.jsx';
import isMobileDevice from '../../lib/isMobileDevice.js';

const INPUT_STYLE = {
    boxSizing: 'border-box',
    MozBoxSizing: 'border-box',
    border: '1px solid transparent',
    width: '240px',
    height: '32px',
    marginTop: '27px',
    padding: '0 12px',
    borderRadius: '1px',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
    fontSize: '14px',
    outline: 'none',
    textOverflow: 'ellipses',
    paddingRight: '50px'
};

const getmarker = (latLng) => {
    return {
        position: latLng,
        key: Date.now(),
        showInfo: false
        // defaultAnimation: 1
    };
};


// Search Box helper
// https://tomchentw.github.io/react-google-maps/places/search-box
const GoogleMapWithMarker = withGoogleMap(props => (
    <GoogleMap
      defaultZoom={props.zoom}
      center={props.center}
      onClick={props.onMapClick}
      onDblClick={props.onMapDoubleClick}
    >
        <SearchBox
          ref={props.onSearchBoxMounted}
          bounds={props.bounds}
          controlPosition={google.maps.ControlPosition.TOP_LEFT}
          onPlacesChanged={props.onPlacesChanged}
          inputPlaceholder="Search Location"
          inputStyle={INPUT_STYLE}

        />
        {props.markers.map(marker => (
            <Marker
              {...marker}
              draggable
              onDragEnd={props.onMapClick}
              onClick={() => props.onMarkerClick(marker)}
            >
                {marker.showInfo && isMobileDevice() && (
                    <InfoWindow onCloseClick={() => props.onMarkerClose(marker)}>
                        <div>
                            double click to pin
                        </div>
                    </InfoWindow>
                )}
            </Marker>
        ))}
    </GoogleMap>
));

class EditMap extends React.Component {

    constructor(props) {
        super(props);
        const { zoom, latitude, longitude } = props;

        this.onMapClick = this.onMapClick.bind(this);
        this.onMapDoubleClick = this.onMapDoubleClick.bind(this);
        this.handleSearchBoxMounted = this.handleSearchBoxMounted.bind(this);
        this.handlePlacesChanged = this.handlePlacesChanged.bind(this);
        this.handleMarkerClick = this.handleMarkerClick.bind(this);
        this.handleMarkerClose = this.handleMarkerClose.bind(this);

        this.state = {
            zoom,
            center: { lat: latitude, lng: longitude },
            markers: [getmarker({ lat: latitude, lng: longitude })],
            isLoading: false,
            isOpen: false
        };
    }

    onMapClick(event) {
        if (!isMobileDevice()) {
            this.updateMarker(event);
        }
    }

    onMapDoubleClick(event) {
        if (isMobileDevice()) {
            this.updateMarker(event);
        }
    }

    updateMarker(event) {
        const { updateLocation } = this.props;
        const marker = getmarker(event.latLng);
        this.setState({ markers: [marker] });

        const locData = {
            latitude: event.latLng.lat(),
            longitude: event.latLng.lng()
        };

        updateLocation(locData);
    }

    handleSearchBoxMounted(searchBox) {
        this.searchBox = searchBox;
    }

    handlePlacesChanged() {
        const places = this.searchBox.getPlaces();

        const markers = places.map(place => ({
            position: place.geometry.location,
            defaultAnimation: 1
        }));

        // Set markers; set map center to first search result
        const mapCenter = markers.length > 0 ? markers[0].position : this.state.center;

        this.setState({
            center: mapCenter
        });
    }

    handleMarkerClick(targetMarker) {
        this.setState({
            markers: this.state.markers.map(marker => {
                if (marker === targetMarker) {
                    return {
                        ...marker,
                        showInfo: true
                    };
                }
                return marker;
            })
        });
    }

    handleMarkerClose(targetMarker) {
        this.setState({
            markers: this.state.markers.map(marker => {
                if (marker === targetMarker) {
                    return {
                        ...marker,
                        showInfo: false
                    };
                }
                return marker;
            })
        });
    }

    render() {
        const { closeModal } = this.props;
        return (
            <div className="w-100 relative h-100">
                {
                    this.state.isLoading &&
                    <div className="text-align--center absolute w-100 h-100 z-999 pv5 bg-black-20">
                        <Loader className="w-40" />
                    </div>
                }
                <GoogleMapWithMarker
                  containerElement={<div className="h-100" style={{ paddingBottom: '50px' }} />}
                  mapElement={<div className="h-100" />}
                  center={this.state.center}
                  markers={this.state.markers}
                  zoom={this.state.zoom}
                  onMapClick={this.onMapClick}
                  onMapDoubleClick={this.onMapDoubleClick}
                  onSearchBoxMounted={this.handleSearchBoxMounted}
                  onPlacesChanged={this.handlePlacesChanged}
                  onMarkerClick={this.handleMarkerClick}
                  onMarkerClose={this.handleMarkerClose}
                />
                <div className="shadow-top-lb-box pv1 relative z-9999 absolute bottom-0 left-0 w-100">
                    <div className="text-left pa2 bg-black-70 white" style={{ fontSize: '.9rem' }}>
                        Please pin the Location on the road near the entry of the property
                    </div>
                    <div className="text-right">
                        <Button className="Button btn-sm-white ma1 w-100" onClick={closeModal} >
                            Done
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

EditMap.defaultProps = {
    zoom: 15
};


EditMap.propTypes = {
    latitude: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    zoom: PropTypes.number,
    closeModal: PropTypes.func.isRequired,
    updateLocation: PropTypes.func.isRequired
};


export default EditMap;
