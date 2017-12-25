import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { getState as appState, actions as appActions } from '../reducers';
import StartHosting from '../components/StartHosting/StartHosting.jsx';

const mapStateToProps = (state) => {
    const userId = appState.session.userId(state);
    const user = appState.user.getUser(state, userId);
    return { user };
};

class StartHostingContainer extends React.Component {
    static propTypes = {
        fetchSupportedCities: PropTypes.func.isRequired
    }

    componentDidMount() {
        this.props.fetchSupportedCities();
    }

    render() {
        return <StartHosting {...this.props} />;
    }
}

export default connect(mapStateToProps, {
    fetchSupportedCities: appActions.homePage.fetchSupportedCities,
    createProperty: appActions.property.createProperty,
    updatePropertyDetails: appActions.property.updatePropertyDetails,
    showMessageModal: appActions.modals.showMessageModal,
    addPropertyImage: appActions.property.addPropertyImage,
    addPropertyPanoramaImage: appActions.property.addPropertyPanoramaImage,
    addPropertyVideo: appActions.property.addPropertyVideo,
    lookupUser: appActions.user.lookupUser
})(StartHostingContainer);
