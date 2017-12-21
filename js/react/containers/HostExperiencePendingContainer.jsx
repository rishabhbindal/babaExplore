import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import { actions, getState } from '../reducers';

import HostPageLayout from '../components/HostPageLayout/HostPageLayout.jsx';
import HostAvailableResponses from '../components/HostAvailableResponses/HostAvailableResponses.jsx';
import Loader from './../components/Loader/Loader.jsx';

const { bool, func, array } = PropTypes;
const mapStateToProps = (state) => {
    const awaitingExperiences = getState.hostExperiences.getAwaitingExperiences(state) || [];
    const isLoading = getState.hostExperiences.isAwaitingExperiencesLoading(state) || false;

    return { awaitingExperiences, isLoading };
};

const propertyType = 'EXPERIENCE';

class HostExperiencePendingContainer extends React.Component {

    static propTypes = {
        isLoading: bool.isRequired,
        fetchAwaitingResponses: func.isRequired,
        awaitingExperiences: array
    }

    componentDidMount() {
        this.props.resetAwaitingResponses();
        this.props.fetchAwaitingResponses({ type: propertyType });
    }

    render() {
        const { awaitingExperiences, isLoading } = this.props;

        const loader = (
            <div className="text-align--center">
                <Loader size="large" />
            </div>
        );

        const listResponses = () => (
            (awaitingExperiences && awaitingExperiences.length > 0) ? (
                <HostAvailableResponses awaitingResponses={awaitingExperiences} />
            ) : (<div className="text-align--center">No Results Available</div>)
        );

        const handleFilter = ({ propertyCode }) => {
            let params = { type: propertyType };
            if (propertyCode) {
                params.code = propertyCode;
            }
            this.props.fetchAwaitingResponses(params);
        };

        return (
            <HostPageLayout handleFilter={handleFilter} propertyType={propertyType}>
                { (!awaitingExperiences || isLoading) ? loader : listResponses() }
            </HostPageLayout>
        );
    }
}

export default connect(mapStateToProps, {
    resetAwaitingResponses: actions.hostExperiences.resetAwaitingExperiences,
    fetchAwaitingResponses: actions.hostExperiences.fetchAwaitingExperiences
})(HostExperiencePendingContainer);
