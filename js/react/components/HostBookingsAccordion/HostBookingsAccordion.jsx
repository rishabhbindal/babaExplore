import React, { PropTypes } from 'react';
import Collapse, { Panel } from 'rc-collapse';

import UserAvatar from '../UserAvatar/UserAvatar.jsx';
import Loader from './../Loader/Loader.jsx';
import BookingDateRange from './../BookingDateRange/BookingDateRange.jsx';
import HostBookingDetailsContainer from '../../containers/HostBookingDetailsContainer.jsx';
import './HostBookingsAccordion.scss';

class HostBookingsAccordion extends React.Component {

    static propTypes = {
        orders: PropTypes.arrayOf(PropTypes.object)
    };

    constructor(props) {
        super(props);
        this.header = this.header.bind(this);
        this.handleAccordion = this.handleAccordion.bind(this);
        this.resetBookingDetails = this.resetBookingDetails.bind(this);

        this.state = {
            bookingDetails: null
        };
    }

    componentDidMount() {
        const { orders } = this.props;

        if (orders && orders.length > 0) {
            this.handleAccordion('0');
        }
    }

    resetBookingDetails() {
        this.setState({ bookingDetails: null });
    }

    handleAccordion(key) {
        if (!key) {
            return null;
        }
        this.resetBookingDetails();
        const { orders } = this.props;
        const order = orders[key];
        let bookingDetails;
        if (order) {
            const { checkIn, checkOut, url, owner } = order;
            bookingDetails = (
                <HostBookingDetailsContainer
                  checkIn={checkIn}
                  checkOut={checkOut}
                  ownerUrl={owner}
                  orderUrl={url}
                  key={url}
                />
            );
        }
        return this.setState({ bookingDetails });
    }

    header({ property, checkIn, checkOut, guest }) {
        const headerOwner = (
            guest && (
                <span className="host__user__info">
                    <span className="show-for-medium">
                        <UserAvatar size="small" img={guest.profilePic} desc={guest.name} />
                    </span>
                    <span className="host__name">{ guest.name }</span>
                </span>
            )
        );

        return (
            <span>
                { headerOwner }
                <span className="host__property__info">
                    <span>{ property.caption }</span>
                </span>
                <span className="host__quantities" />
                <span className="host__date show-for-medium">
                    <BookingDateRange
                      checkIn={checkIn.toISOString()}
                      checkOut={checkOut.toISOString()}
                    />
                </span>
            </span>
        );
    }


    render() {
        const { orders } = this.props;

        return (
            <Collapse
              accordion
              className="booking__accordion"
              onChange={this.handleAccordion}
              defaultActiveKey="0"
            >
                {
                    orders.map((order, id) => (
                        <Panel header={this.header(order)} key={id}>
                            {
                                this.state.bookingDetails ||
                                <div className="text-align--center"><Loader size="large" /></div>
                            }
                        </Panel>
                    ))
                }
            </Collapse>
        );
    }
}

export default HostBookingsAccordion;
