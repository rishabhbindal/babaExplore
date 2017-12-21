import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import { actions, getState } from '../reducers';

import Loader from './../components/Loader/Loader.jsx';
import HostPropertiesAccordion from '../components/HostPropertiesAccordion/HostPropertiesAccordion.jsx';
import HostPageLayout from './../components/HostPageLayout/HostPageLayout.jsx';

const mapStateToProps = (state) => {
    const result = getState.hostProperties.getProperties(state);
    const isLoading = getState.hostProperties.isPropertiesFetching(state) || false;

    return { result, isLoading };
};

const propertyType = 'ACCOMMODATION';

class HostPropertiesContainer extends React.Component {

    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        fetchHostProperties: PropTypes.func,
        resetHostProperties: PropTypes.func,
        result: PropTypes.shape({
            properties: PropTypes.array
        })
    }

    componentDidMount() {
        this.props.resetHostProperties();
        this.props.fetchHostProperties({ type: propertyType });
    }

    render() {
        const { result, isLoading } = this.props;

        const handleFilter = ({ propertyCode }) => {
            let params = { type: propertyType };
            if (propertyCode) {
                params.code = propertyCode;
            }
            this.props.resetHostProperties();
            this.props.fetchHostProperties(params);
        };

        return (
            <HostPageLayout handleFilter={handleFilter} propertyType={propertyType}>
                {
                    (result.count <= 0 && isLoading) ?
                    <div className="text-align--center"><Loader /></div> :
                    <HostPropertiesAccordion properties={result.properties} />
                }
            </HostPageLayout>
        );
    }
}

export default connect(mapStateToProps, {
    resetHostProperties: actions.hostProperties.resetProperties,
    fetchHostProperties: actions.hostProperties.fetchProperties
})(HostPropertiesContainer);
