import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import moment from 'moment';

import { actions, getState } from '../reducers';
import HostPageLayout from './../components/HostPageLayout/HostPageLayout.jsx';
import Loader from './../components/Loader/Loader.jsx';
import HostBookingsAccordion from '../components/HostBookingsAccordion/HostBookingsAccordion.jsx';

const mapStateToProps = (state) => {
    const result = getState.hostProperties.getPastOrders(state);
    const isLoading = getState.hostProperties.isPastOrdersLoading(state) || false;

    return { isLoading, result };
};

const propertyType = 'ACCOMMODATION';
class PastBookingsContainer extends React.Component {

    static propTypes = {
        isLoading: PropTypes.bool.isRequired,
        result: PropTypes.shape({
            orders: PropTypes.array,
            count: PropTypes.number,
            prev: PropTypes.string,
            next: PropTypes.string

        }),
        fetchPastOrders: PropTypes.func.isRequired,
        resetPastOrders: PropTypes.func.isRequired,
        fetchPastOrdersByUrl: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.state = {
            type: propertyType,
            checkin_date_from: '2012-01-01',
            checkin_date_to: moment().subtract(1, 'days').format('YYYY-MM-DD'),
            host: true,
            sort_by: '-checkin_date'
        };
    }

    componentDidMount() {
        this.props.resetPastOrders();
        this.props.fetchPastOrders(this.state);
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
                this.props.fetchPastOrdersByUrl(result.next);
            }
        };

        const handleFilter = ({ propertyId }) => {
            let params = Object.assign({}, this.state);
            if (propertyId) {
                params.property = propertyId;
            }
            this.props.resetPastOrders();
            this.props.fetchPastOrders(params);
        };

        return (
            <HostPageLayout handleFilter={handleFilter} propertyType={propertyType} isPastBooking={true}>
                <div>
                    { (isLoading && result.count < 1) ? loader : list() }
                    {
                        !!result.next && (<div className="booking__pagination">
                            {
                                isLoading ? (<div className="pagination__loader"><Loader /></div>) : (
                                    <a href="#" onClick={handleLoadMore}>
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
    fetchPastOrders: actions.hostProperties.fetchPastOrders,
    resetPastOrders: actions.hostProperties.resetPastOrders,
    fetchPastOrdersByUrl: actions.hostProperties.fetchPastOrdersByUrl
})(PastBookingsContainer);
