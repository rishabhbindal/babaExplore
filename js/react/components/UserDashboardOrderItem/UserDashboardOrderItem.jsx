import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

import PropertyImagesCollage from './../PropertyImagesCollage/PropertyImagesCollage.jsx';
import BookingDateRange from './../BookingDateRange/BookingDateRange.jsx';
import { eventPropertyType } from './../../data-shapes/property.js';
import UserDashboardReview from './../UserDashboardReview/UserDashboardReview.jsx';

const UserDashboardOrderItem = ({ order, fetchCancellationPolicy }) => {
    const { url, id, property, bill, bookingType, date, requestedGuests, requestedRooms } = order;
    return (<div className="UserDashboardOrderItem row" key={id}>
        <div className="UserDashboardOrderItem-collage">
            <PropertyImagesCollage property={property} />
        </div>
        <div className="UserDashboardOrderItem-summary">
            <h5 className="UserDashboardOrderItem--title">
                <Link to={`/${property.isExperience ? 'events' : 'listing'}/${property.code}`}>
                    { property && property.caption}
                </Link>
            </h5>
            <div className="UserDashboardOrderItem--location">
                { property && [property.city, property.state].join(', ') }
            </div>
            {
                bill && bill.amountRemaining && bill.amountRemaining > 0 ?
                (
                    <div className="UserDashboardOrderItem--PaymentDetails">
                        Payment Remaining ₹ {bill.amountRemaining}
                    </div>
                ) :
                ''
            }
            <hr style={{ margin: '0.5rem 0', width: '25%' }} />
            {
                bookingType !== 'History' && (
                    <div className="UserDashboardOrderItem--details">
                        <BookingDateRange
                          checkIn={date.from.toISOString()}
                          checkOut={date.until.toISOString()}
                          alignLeft
                        />
                        <div className="clearfix" />
                        <b>{`${requestedGuests} guests, ${requestedRooms} rooms`}</b>
                        <div className="clearfix" />
                        <b className="clearfix">₹{bill.amountPaid} paid</b>
                        <div className="clearfix" />
                        {
                            bookingType === 'Upcoming' &&
                            (<button className="tiny hollow button" onClick={() => { fetchCancellationPolicy(property.cancellationPolicy, order); }}>
                                Cancel booking
                            </button>
                            )
                        }

                    </div>
                )
            }
            {
                bookingType === 'History' &&
                <UserDashboardReview
                  {...date}
                  orderId={id}
                  orderUrl={url}
                  propertyUrl={property.url}
                  propertyId={property.id}
                />
            }
        </div>
        <div className="clearfix" />
    </div>);
};

UserDashboardOrderItem.propTypes = {
    url: PropTypes.string,
    id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number]),
    property: eventPropertyType,
    bill: PropTypes.object,
    bookingType: PropTypes.string,
    date: PropTypes.object,
    requestedGuests: PropTypes.number,
    requestedRooms: PropTypes.number
};

export default UserDashboardOrderItem;
