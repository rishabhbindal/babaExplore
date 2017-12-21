import React, { PropTypes } from 'react';
import GoogleMapReact from 'google-map-react';
import { fitBounds } from 'google-map-react/utils';

import { eventPropertyType } from '../../data-shapes/property.js';
import Loader from './../Loader/Loader.jsx';
import MapviewPropertyPreview from '../MapviewPropertyPreview/MapviewPropertyPreview.jsx';
import GoogleMapScriptLoader from '../GoogleMapScriptLoader.jsx';

import './SearchResultsMapView.scss';

const DEFAULT_MAP_CENTER = [20.5937, 77.6322093];

class MapView extends React.Component {
    constructor(props) {
        super(props);
        this.onChange = this.onChange.bind(this);
        this.setInfoWindowPersist = this.setInfoWindowPersist.bind(this);

        this.state = {};
    }

    // call onChange whenever new properties are loaded
    componentWillReceiveProps(nextProps) {
        const getFirstPropertyUrl = results => results.properties[0] && results.properties[0].url;
        const currentFirstProperty = getFirstPropertyUrl(this.props.searchResult);
        const nextPropsFirstProperty = getFirstPropertyUrl(nextProps.searchResult);

        if (nextProps.searchResult.properties
            && (nextProps.searchResult.count !== this.props.searchResult.count
                || currentFirstProperty !== nextPropsFirstProperty
                || !this.state.properties
            )) {
            const { width, height } = this.mapContainer.getBoundingClientRect();
            this.onChange({ size: { width, height }, properties: nextProps.searchResult.properties });
            this.setState({ properties: nextProps.searchResult.properties });
        }
    }

    onChange({ size, properties }) {
        const props = properties || this.state.properties;
        if (!props || !props.length) {
            return;
        }
        const requiredBounds = new google.maps.LatLngBounds(); // eslint-disable-line no-undef
        props.forEach((prop) => {
            if (prop.lat && prop.long) {
                requiredBounds.extend(new google.maps.LatLng(prop.lat, prop.long)); // eslint-disable-line no-undef
            }
        });
        const formattedReqBounds = {
            ne: { lat: requiredBounds.getNorthEast().lat(), lng: requiredBounds.getNorthEast().lng() },
            sw: { lat: requiredBounds.getSouthWest().lat(), lng: requiredBounds.getSouthWest().lng() }
        };
        let { zoom, center } = fitBounds(formattedReqBounds, size);
        if (props.length === 1) {
            center = { lat: props[0].lat, lng: props[0].long };
            zoom = 15;
        }
        this.setState({ zoom, center });
    }

    setInfoWindowPersist(url) {
        this.setState({
            properties: this.state.properties.map((prop) => {
                let persistInfoWindow = false;
                if (prop.url === url) {
                    persistInfoWindow = !prop.persistInfoWindow;
                }
                return { ...prop, persistInfoWindow };
            })
        });
    }

    render() {
        const { searchResult, isLoading } = this.props;
        return (
            <div className="MapView__container" style={{ overflow: 'auto' }}>
                <div>
                    { isLoading && <div className="text-align--center" style={{ margin: '1rem' }}>
                        <Loader size="large" />
                    </div> }
                    {
                        searchResult && searchResult.properties.length < 1 && !isLoading &&
                        <div style={{ textAlign: 'center', margin: '2rem 0', fontWeight: 'bold' }}>
                            No results found.
                        </div>
                    }
                </div>
                <GoogleMapScriptLoader>
                    <div
                      className="MapView__map__container"
                      style={{ zIndex: '9' }}
                      ref={(ref) => { this.mapContainer = ref; }}
                    >
                        <div className="MapView__map" style={{ height: '80vh' }}>
                            {this.state.properties && <GoogleMapReact
                              onChange={this.onChange}
                              center={this.state.center || DEFAULT_MAP_CENTER}
                              zoom={this.state.zoom || 15}
                              hoverDistance={50}
                            >
                                {
                                    this.state.properties.filter(prop => prop.lat && prop.long).map(prop => (
                                        <MapviewPropertyPreview
                                          lat={prop.lat}
                                          lng={prop.long}
                                          key={prop.url}
                                          prop={prop}
                                          setInfoWindowPersist={this.setInfoWindowPersist}
                                        />
                                    ))
                                }
                            </GoogleMapReact>}
                        </div>
                    </div>
                </GoogleMapScriptLoader>
            </div>
        );
    }
}

MapView.defaultProps = {
    isLoading: false
};

MapView.propTypes = {
    searchResult: React.PropTypes.shape({
        properties: React.PropTypes.arrayOf(React.PropTypes.shape(eventPropertyType)),
        next: React.PropTypes.string,
        previous: React.PropTypes.string,
        count: React.PropTypes.number,
        loading: React.PropTypes.bool
    }).isRequired,
    isLoading: React.PropTypes.bool
};

export default MapView;
