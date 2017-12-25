import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import moment from 'moment';

import { actions, getState } from '../reducers';

import HostPageLayout from '../components/HostPageLayout/HostPageLayout.jsx';
import Loader from './../components/Loader/Loader.jsx';
import HostBookingsAccordion from '../components/HostBookingsAccordion/HostBookingsAccordion.jsx';

const mapStateToProps = (state) => {
    const result = getState.hostExperiences.getUpcomingExperiences(state);
    const isLoading = getState.hostExperiences.isUpcomingExperiencesLoading(state) || false;
    return { isLoading, result };
};

const propertyType = 'EXPERIENCE';

class UpcomingExperiencesContainer extends React.Component {

    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        result: PropTypes.shape({
            bookings: PropTypes.array,
            count: PropTypes.number,
            prev: PropTypes.string,
            next: PropTypes.string

        }),
        fetchUpcomingExperiences: PropTypes.func.isRequired,
        resetUpcomingExperiences: PropTypes.func.isRequired,
        fetchUpcomingExperiencesByUrl: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        this.state = {
            type: propertyType,
            date_from: moment().format('YYYY-MM-DD'),
            date_until: '3000-01-01',
            sort_by: 'date_from'
        };
    }

    componentDidMount() {
        this.props.resetUpcomingExperiences();
        this.props.fetchUpcomingExperiences(this.state);
    }

    render() {
        const { isLoading, result } = this.props;

        const loader = (
            <div className="text-align--center">
                <Loader size="large" />
            </div>
        );

        const list = () => (
            (result.count > 0) ?
            <HostBookingsAccordion orders={result.orders} /> :
            <div className="text-align--center">No Results Available</div>
        );

        const handleLoadMore = () => {
            if (!!result.next) {
                this.props.fetchUpcomingExperiencesByUrl(result.next);
            }
        };

        const handleFilter = ({ propertyId }) => {
            let params = Object.assign({}, this.state);
            if (propertyId) {
                params.property = propertyId;
            }
            this.props.resetUpcomingExperiences();
            this.props.fetchUpcomingExperiences(params);
        };

        return (
            <HostPageLayout handleFilter={handleFilter} propertyType={propertyType}>
                <div>
                    { (isLoading && result.count < 1) ? loader : list() }
                    {
                        !!result.next && (<div className="booking__pagination">
                            {
                                isLoading ?
                                (<div className="pagination__loader"><Loader /></div>) :
                                (<a href="#" onClick={handleLoadMore}>
                                    Load More ({ (result.count - result.orders.length) })
                                </a>)
                            }
                        </div>)
                    }
                </div>
            </HostPageLayout>
        );
    }
}

export default connect(mapStateToProps, {
    fetchUpcomingExperiences: actions.hostExperiences.fetchUpcomingExperiences,
    resetUpcomingExperiences: actions.hostExperiences.resetUpcomingExperiences,
    fetchUpcomingExperiencesByUrl: actions.hostExperiences.fetchUpcomingExperiencesByUrl
})(UpcomingExperiencesContainer);
