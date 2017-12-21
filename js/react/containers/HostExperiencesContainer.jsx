import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import { actions, getState } from '../reducers';
import Loader from './../components/Loader/Loader.jsx';
import HostPropertiesAccordion from '../components/HostPropertiesAccordion/HostPropertiesAccordion.jsx';
import HostPageLayout from '../components/HostPageLayout/HostPageLayout.jsx';

const { bool, func, array, number, string, shape } = PropTypes;

const mapStateToProps = (state) => {
    const result = getState.hostExperiences.getExperiences(state);
    const isLoading = getState.hostExperiences.isExperienceLoading(state) || false;

    return { result, isLoading };
};

const propertyType = 'EXPERIENCE';

class HostExperiencesContainer extends React.Component {

    static propTypes = {
        isLoading: bool.isRequired,
        result: shape({
            experiences: array,
            count: number,
            prev: string,
            next: string
        }),
        fetchExperiences: func.isRequired,
        resetExperiences: func.isRequired
    }

    componentDidMount() {
        this.props.resetExperiences();
        this.props.fetchExperiences({ type: propertyType });
    }

    render() {
        const { result, isLoading } = this.props;

        const handleFilter = ({ propertyCode }) => {
            let params = { type: propertyType };
            if (propertyCode) {
                params.code = propertyCode;
            }
            this.props.resetExperiences();
            this.props.fetchExperiences(params);
        };

        return (
            <HostPageLayout handleFilter={handleFilter} propertyType={propertyType}>
                {
                    (result.count <= 0 && isLoading) ?
                    <div className="text-align--center"><Loader /></div> :
                    <HostPropertiesAccordion properties={result.experiences} />
                }
            </HostPageLayout>
        );
    }
}

export default connect(mapStateToProps, {
    fetchExperiences: actions.hostExperiences.fetchExperiences,
    resetExperiences: actions.hostExperiences.resetExperiences
})(HostExperiencesContainer);
