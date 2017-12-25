import React, { PropTypes } from 'react';
import canUseDOM from 'can-use-dom';
import { connect } from 'react-redux';

import EditMap from '../EditProperty/EditMap.jsx';
import LightBox from '../LightBox/LightBox.jsx';
import { actions as appActions } from '../../reducers';

const geolocation = (
    canUseDOM && navigator.geolocation ? navigator.geolocation :
    ({
        getCurrentPosition(success, failure) {
            failure('Your browser doesn\'t support geolocation.');
        }
    })
);

const getLocationDetails = (locComponents) => {
    if (!locComponents) {
        return null;
    }
    const defaultCountry = 'India';
    const locPart = key => locComponents.filter(component => component.types.indexOf(key) > -1)[0];

    const country = locPart('country');
    const state = locPart('administrative_area_level_1');
    const city = locPart('locality');

    const premise = locPart('premise');
    const streetNumber = locPart('street_number');
    const route = locPart('route');
    const sublocality2 = locPart('sublocality_level_2');
    const sublocality1 = locPart('sublocality_level_1');
    const postalCode = locPart('postal_code');

    const address = [premise, streetNumber, route, sublocality2, sublocality1]
        .map(addrPart => addrPart && addrPart.long_name)
        .filter(addrPart => addrPart);

    if (!(country && state && city)) {
        return null;
    } else if (country.long_name !== defaultCountry) {
        return null;
    }
    return {
        country: country.long_name,
        state: state.long_name,
        city: city.long_name,
        postal_code: postalCode.long_name,
        street_address: address.join(', ')
    };
};

class CreatePropertyMap extends React.Component {

    static propTypes = {
        closeModal: PropTypes.func.isRequired,
        onLocationChange: PropTypes.func.isRequired,
        showMessageModal: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        const { latitude, longitude } = this.props;
        const location = latitude ? { latitude, longitude } : null;

        this.state = {
            location
        };
        this.isUnmounted = false;

        this.onLocationChange = this.onLocationChange.bind(this);
    }

    componentDidMount() {
        geolocation.getCurrentPosition((position) => {
            if (this.isUnmounted) {
                return;
            }
            this.setState({
                location: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                },
                content: 'Location found using HTML5.'
            });
        }, (reason) => {
            if (this.isUnmounted) {
                return;
            }
            this.setState({
                location: {
                    latitude: 12.9716,
                    longitude: 77.5946
                },
                content: `Error: The Geolocation service failed (${reason}).`
            });
        });
    }

    componentWillUnmount() {
        this.isUnmounted = true;
    }

    onLocationChange({ latitude, longitude }) {
        const { onLocationChange, showMessageModal } = this.props;

        this.setState({ latitude, longitude });

        const geocoder = new google.maps.Geocoder;
        geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
            const address_components = results[0] && results[0].address_components && results[0].address_components.length > 0 && results[0].address_components;
            const location = getLocationDetails(address_components);

            if (status !== 'OK') {
                showMessageModal('Error', `Geocoder failed due to: ${status}`);
            } else if (!address_components) {
                showMessageModal('Error', 'No results found, Please select another location');
            } else if (!location) {
                showMessageModal('Error', 'Please select valid location');
            } else {
                onLocationChange(Object.assign(location, { latitude, longitude }));
            }
        });
    }


    render() {
        const { closeModal } = this.props;
        const { location } = this.state;

        if (!location) {
            return null;
        }
        return (
            <div className="w-100 relative h-100">
                <LightBox
                  isOpen
                  closeModal={closeModal}
                >
                    <EditMap
                      latitude={location.latitude}
                      longitude={location.longitude}
                      closeModal={closeModal}
                      updateLocation={this.onLocationChange}
                    />
                </LightBox>
            </div>
        );
    }
}

export default connect(null, {
    showMessageModal: appActions.modals.showMessageModal
})(CreatePropertyMap);
