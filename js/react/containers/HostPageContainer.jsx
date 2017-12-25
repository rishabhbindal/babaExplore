import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import { actions, getState } from '../reducers';

import HostPageLayout from '../components/HostPageLayout/HostPageLayout.jsx';
import HostAvailableResponses from '../components/HostAvailableResponses/HostAvailableResponses.jsx';
import Loader from './../components/Loader/Loader.jsx';

const mapStateToProps = (state) => {
    const awaitingResponses = getState.hostProperties.getAwaitingResponses(state);
    const isLoading = getState.hostProperties.isFetching(state) || false;
    const gatewayCharge = getState.appConfig.getServiceChargeRate(state);

    return { awaitingResponses, isLoading, gatewayCharge };
};

const propertyType = 'ACCOMMODATION';

class HostPageContainer extends React.Component {

    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        fetchAwaitingResponses: PropTypes.func,
        resetAwaitingResponses: PropTypes.func,
        awaitingResponses: PropTypes.array
    }

    componentDidMount() {
        this.props.resetAwaitingResponses();
        this.props.fetchAwaitingResponses({ type: propertyType });
    }

    render() {
        const { gatewayCharge, awaitingResponses, isLoading } = this.props;

        const loader = (
            <div className="text-align--center">
                <Loader size="large" />
            </div>
        );

        const listResponses = () => (
            (awaitingResponses && awaitingResponses.length > 0) ? (
                <HostAvailableResponses awaitingResponses={awaitingResponses} gatewayCharge={gatewayCharge} />
            ) : (<div className="text-align--center">No Results Available</div>)
        );

        const handleFilter = ({ propertyCode }) => {
            let params = { type: propertyType };
            if (propertyCode) {
                params.code = propertyCode;
            }
            this.props.resetAwaitingResponses();
            this.props.fetchAwaitingResponses(params);
        };

        return (
            <HostPageLayout handleFilter={handleFilter} propertyType={propertyType}>
                { isLoading ? loader : listResponses() }
            </HostPageLayout>
        );
    }
}

export default connect(mapStateToProps, {
    resetAwaitingResponses: actions.hostProperties.resetAwaitingResponses,
    fetchAwaitingResponses: actions.hostProperties.fetch,
    resetAwaitingResponses: actions.hostProperties.resetAwaitingResponses
})(HostPageContainer);
