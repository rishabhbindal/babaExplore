import React, { PropTypes } from 'react';

import Collapse, { Panel } from 'rc-collapse';
import './HostAvailableResponses.scss';
import TruncatedText from '../TruncatedText/TruncatedText.jsx';
import UserInfo from '../UserInfo/UserInfo.jsx';
import BookingDateRange from './../BookingDateRange/BookingDateRange.jsx';

import AwaitingResponseFormContainer from '../../containers/AwaitingResponseFormContainer.jsx';
import UserAvatar from '../UserAvatar/UserAvatar.jsx';

const HostAvailableResponses = ({ awaitingResponses, gatewayCharge }) => {
    const panelItem = (title, value) => (
        <small>
            <b>{ title }: </b>
            <span>{ value }</span>
        </small>
    );

    const sumUp = arr => arr.reduce((sum, data) => sum + data);

    const headerContent = (response) => {
        const { checkIn, checkOut, owner, property, totalRequestedQuantities } = response;

        return (
            <span>
                <span className="host__user__info">
                    <span className="show-for-medium">
                        <UserAvatar size="small" img={owner.profilePic} desc={owner.name} />
                    </span>
                    <span className="host__name">{ owner.name }</span>
                </span>
                <span className="host__property__info">
                    <span>{ property.caption }</span>
                </span>
                <span className="host__quantities">
                    { totalRequestedQuantities } Guest
                </span>
                <span className="host__date show-for-medium">
                    <BookingDateRange
                      checkIn={checkIn.toISOString()}
                      checkOut={checkOut.toISOString()}
                    />
                </span>
            </span>
        );
    };

    const hostBooking = (checkIn, checkOut, bookingItem, quantityMap) => {
        const dayDifference = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));
        const quantity = Object.values(quantityMap)
            .find(data => (data.id === bookingItem.id)).requested;
        const extraGuests = Object.values(quantityMap)
            .find(data => (data.id === bookingItem.id)).extra_guests;
        const { dailyPrice, caption, pricing: { guestCharge } } = bookingItem;

        return (
            <div>
                <b>{ caption }</b> - <b>Rs. { quantity * dailyPrice * dayDifference }</b>
                <br />
                <small>{ quantity } Rooms X Rs. { dailyPrice } X { dayDifference } Days</small>
                { !!extraGuests && <div>
                    <small>{ extraGuests } Guests X Rs. { guestCharge } X { dayDifference } Days</small>
                </div> }
                <br className="hide-for-medium" />
                <small className="hide-for-medium">
                    { panelItem('Check In', checkIn.format('Do MMM YYYY')) }
                    <br />
                    { panelItem('Check Out', checkOut.format('Do MMM YYYY')) }
                </small>
            </div>
        );
    };

    const panelContent = (response) => {
        const { checkIn, checkOut, bookedItems, quantityMap, owner, visitorMessage, url } = response;
        const gatewayFee = downpayment => downpayment * (gatewayCharge / 100);
        const totalPayout = sumUp(Object.values(quantityMap).map(data => data.downpayment));

        return (
            <div className="row">
                <div className="host__info">
                    <UserInfo
                      img={owner.profilePic}
                      name={owner.name}
                      quote={<TruncatedText text={owner.ownerPropertyIntro} limit={60} />}
                      fullWidth
                    />
                </div>
                <hr className="hide-for-medium" />
                <div className="host__bookings">
                    {
                        bookedItems.map((item, id) => (
                            <div key={id}>
                                {
                                    hostBooking(checkIn, checkOut, item, quantityMap)
                                }
                            </div>
                        ))
                    }
                    <br />
                    { panelItem('Total Payout', totalPayout.toFixed(2)) }
                </div>
                <hr />
                <div className="host__message">
                    <div className="title">Visitor Message: </div>
                    <span>{ visitorMessage }</span>
                </div>
                <hr className="hide-for-medium" />
                <AwaitingResponseFormContainer url={url} />
            </div>
        );
    };

    return (
        <Collapse accordion={false} className="host__accordion" defaultActiveKey="0">
            {
                awaitingResponses && awaitingResponses.map((response, id) => (
                    <Panel header={headerContent(response)} key={id}>
                        { panelContent(response) }
                    </Panel>
                ))
            }
        </Collapse>
    );
};

HostAvailableResponses.propTypes = {
    awaitingResponses: PropTypes.arrayOf(PropTypes.object)
};

export default HostAvailableResponses;
