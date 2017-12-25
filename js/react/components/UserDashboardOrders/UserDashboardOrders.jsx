import React, { PropTypes } from 'react';
import moment from 'moment';
import cls from 'classnames';
import idFromURLEnd from '../../lib/idFromURLEnd.js';
import { connect } from 'react-redux';
import { actions, getState as appState } from '../../reducers';
import UserDashboardOrderItem from './../UserDashboardOrderItem/UserDashboardOrderItem.jsx';
import BookingCancellationModal from '../BookingCancellationModal/BookingCancellationModal.jsx';
import Loader from './../Loader/Loader.jsx';
import Pagination from './../Pagination/Pagination.jsx';
import './UserDashboardOrders.scss';

const UserDashboardHeader = ({ options, activeOption, handleHeaderChange }) => {
    const optionCls = option => ({
        'UserDashboardOrders--Header-activeItem': option === activeOption,
        'UserDashboardOrders--Header-item': option !== activeOption
    });

    return (
        <div className="UserDashboardOrders--Header">
            <h5 className="UserDashboardOrders--title">Bookings</h5>
            {
                options.map((option, index) =>
                    <span key={option}>
                        <a
                          className={cls(optionCls(option))}
                          onClick={() => handleHeaderChange(option)}
                        >
                            {option}
                        </a>
                        { ((options.length - 1) !== index) && <span>&nbsp;/&nbsp;</span> }
                    </span>
                )
            }
        </div>
    );
};

UserDashboardHeader.propTypes = {
    options: PropTypes.arrayOf(PropTypes.string),
    activeOption: PropTypes.string,
    handleHeaderChange: PropTypes.func.isRequired
};

const mapStateToProps = (state) => {
    const order = appState.order.getUserOrders(state);
    const isLoading = appState.order.isUserOrdersLoading(state) || false;
    const userId = appState.session.userId(state);
    const user = appState.user.getUser(state, userId);

    return { order, isLoading, user };
};

class UserDashboardOrders extends React.Component {
    static propTypes = {
        resetUserOrders: PropTypes.func.isRequired,
        fetchUserOrders: PropTypes.func.isRequired,
        isLoading: PropTypes.bool.isRequired,
        order: PropTypes.shape({
            count: PropTypes.number,
            next: PropTypes.string,
            previous: PropTypes.string,
            results: PropTypes.array
        }),
        fetchCancellationPolicy: PropTypes.func.isRequired,
        cancelOrder: PropTypes.func.isRequired,
        showMessageModal: PropTypes.func
    }

    constructor(props) {
        super(props);
        this.handleHeaderChange = this.handleHeaderChange.bind(this);
        this.fetch = this.fetch.bind(this);
        this.fetchCancellationPolicy = this.fetchCancellationPolicy.bind(this);
        this.closeCancellationModal = this.closeCancellationModal.bind(this);
        this.cancelOrder = this.cancelOrder.bind(this);
        this.handlePaginationChange = this.handlePaginationChange.bind(this);

        this.state = {
            activeOption: 'Upcoming'
        };
    }

    componentDidMount() {
        this.fetch();
    }

    getParameters(activeOption) {
        const user_id = idFromURLEnd(this.props.user.url);
        switch (activeOption) {
        case 'History':
            return {
                user_id,
                checkin_date_from: '2012-01-01',
                checkin_date_to: moment().subtract(1, 'days').format('YYYY-MM-DD'),
                sort_by: '-checkin_date'
            };
        case 'Ongoing':
            return {
                user_id,
                checkin_date_from: moment().format('YYYY-MM-DD'),
                checkin_date_to: moment().format('YYYY-MM-DD'),
                sort_by: 'checkin_date'
            };
        default:
            return {
                user_id,
                checkin_date_from: moment().add(1, 'days').format('YYYY-MM-DD'),
                checkin_date_to: '3000-01-01',
                sort_by: 'checkin_date'
            };
        }
    }

    handleHeaderChange(option) {
        this.setState({ activeOption: option });
        this.props.resetUserOrders();
        this.props.fetchUserOrders(this.getParameters(option));
    }

    fetch() {
        const { activeOption } = this.state;
        this.props.resetUserOrders();
        this.props.fetchUserOrders(this.getParameters(activeOption));
    }

    fetchCancellationPolicy(name, order) {
        const { fetchCancellationPolicy } = this.props;
        fetchCancellationPolicy(name).then((policy) => {
            this.setState({
                cancellationPolicy: policy.details,
                showBookingCancelModal: true,
                order
            });
        });
    }

    closeCancellationModal() {
        this.setState({ showBookingCancelModal: false, order: undefined });
    }

    cancelOrder(id) {
        const { cancelOrder, showMessageModal } = this.props;
        return cancelOrder(id).then(() => {
            this.closeCancellationModal();
            showMessageModal(
                'Message',
                'Order Cancelled Successfully.'
            );
        }).catch((err) => {
            this.closeCancellationModal();
            showMessageModal(
                'Message',
                'There was some problem in cancelling the order.'
            );
            throw Error(err);
        });
    }

    handlePaginationChange(offset, url) {
        const { isLoading } = this.props;

        if (!isLoading) {
            this.props.resetUserOrders();
            this.props.fetchUserOrdersByUrl(url);
        }
    }

    render() {
        const { activeOption } = this.state;
        const { order, isLoading, user } = this.props;
        const headerOptions = ['History', 'Ongoing', 'Upcoming'];
        return (
            <div className="UserDashboardOrders column">
                <UserDashboardHeader
                  options={headerOptions}
                  activeOption={activeOption}
                  handleHeaderChange={this.handleHeaderChange}
                />
                { isLoading && <div className="text-align--center"><Loader /></div> }
                {
                    order.results && order.results.map(o => (
                        (o.ownerUrl === user.url) &&
                        <UserDashboardOrderItem
                          order={o}
                          key={o.id}
                          fetchCancellationPolicy={this.fetchCancellationPolicy}
                        />
                    ))
                }
                <Pagination
                  count={order.count}
                  previousUrl={order.previous}
                  nextUrl={order.next}
                  onChange={this.handlePaginationChange}
                />
                <BookingCancellationModal
                  message={this.state.cancellationPolicy}
                  isOpen={this.state.showBookingCancelModal}
                  closeModal={this.closeCancellationModal}
                  order={this.state.order}
                  cancelOrder={this.cancelOrder}
                />
            </div>
        );
    }
}

export default connect(mapStateToProps, {
    fetchUserOrders: actions.order.fetchUserOrders,
    fetchUserOrdersByUrl: actions.order.fetchUserOrdersByUrl,
    resetUserOrders: actions.order.resetUserOrders,
    showMessageModal: actions.modals.showMessageModal,
    fetchCancellationPolicy: actions.appConfig.fetchCancellationPolicy,
    cancelOrder: actions.order.cancelOrder
})(UserDashboardOrders);
