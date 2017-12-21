import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import moment from 'moment';

import { actions, getState } from '../reducers';

import HostPageLayout from './../components/HostPageLayout/HostPageLayout.jsx';
import Loader from './../components/Loader/Loader.jsx';
import HostBookingsAccordion from '../components/HostBookingsAccordion/HostBookingsAccordion.jsx';

const mapStateToProps = (state) => {
    const result = getState.hostProperties.getUpcomingOrders(state);
    const isLoading = getState.hostProperties.isUpcomingOrdersLoading(state) || false;
    return { isLoading, result };
};

const propertyType = 'ACCOMMODATION';
class UpcomingBookingsContainer extends React.Component {

    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        result: PropTypes.shape({
            orders: PropTypes.array,
            count: PropTypes.number,
            prev: PropTypes.string,
            next: PropTypes.string

        }),
        fetchUpcomingOrders: PropTypes.func.isRequired,
        resetUpcomingOrders: PropTypes.func.isRequired,
        fetchUpcomingOrdersByUrl: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            type: propertyType,
            checkin_date_from: moment().format('YYYY-MM-DD'),
            checkin_date_to: '3000-01-01',
            host: true,
            sort_by: 'checkin_date'
        };
    }

    componentDidMount() {
        this.props.resetUpcomingOrders();
        this.props.fetchUpcomingOrders(this.state);
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
            if (result.next) {
                this.props.fetchUpcomingOrdersByUrl(result.next);
            }
        };

        const handleFilter = ({ propertyId }) => {
            let params = Object.assign({}, this.state);
            if (propertyId) {
                params.property = propertyId;
            }
            this.props.resetUpcomingOrders();
            this.props.fetchUpcomingOrders(params);
        };

        return (
            <HostPageLayout handleFilter={handleFilter} propertyType={propertyType}>
                <div>
                    { (isLoading && result.count < 1) ? loader : list() }
                    {
                        !!result.next && (<div className="booking__pagination">
                            {
                                isLoading ? (<div className="pagination__loader"><Loader /></div>) : (
                                    <a
                                      href="#"
                                      onClick={handleLoadMore}
                                    >
                                        Load More ({ (result.count - result.orders.length) })
                                    </a>
                                )
                            }
                        </div>)
                    }
                </div>
            </HostPageLayout>
        );
    }
}

export default connect(mapStateToProps, {
    fetchUpcomingOrders: actions.hostProperties.fetchUpcomingOrders,
    resetUpcomingOrders: actions.hostProperties.resetUpcomingOrders,
    fetchUpcomingOrdersByUrl: actions.hostProperties.fetchUpcomingOrdersByUrl
})(UpcomingBookingsContainer);
