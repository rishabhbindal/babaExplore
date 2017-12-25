import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { appState, appActions } from '../reducers';
import HostProperty from '../components/HostProperty/HostProperty.jsx';
import { eventPropertyType } from '../data-shapes/property.js';

const mapStateToProps = (state, { propertyCode }) => {
    const property = appState.property.getProperty(state, propertyCode);

    return { property };
};

class HostPropertyCardContainer extends React.Component {
    static propTypes = {
        fetchProperty: PropTypes.func.isRequired,
        propertyCode: PropTypes.string.isRequired,
        property: eventPropertyType
    }

    static defaultProps = {
        property: null
    }

    componentWillMount() {
        this.fetchData();
    }

    fetchData() {
        if (this.props.property) {
            return Promise.resolve(null);
        }

        return this.props.fetchProperty(this.props.propertyCode);
    }

    render() {
        const { property } = this.props;

        if (!property) {
            return null;
        }

        return <HostProperty property={property} />;
    }
}

export default connect(mapStateToProps, {
    fetchProperty: appActions.property.fetchProperty
})(HostPropertyCardContainer);
