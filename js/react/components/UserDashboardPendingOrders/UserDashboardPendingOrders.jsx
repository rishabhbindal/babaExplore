import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

import Loader from './../Loader/Loader.jsx';
import './UserDashboardPendingOrders.scss';
import BookingDateRange from './../BookingDateRange/BookingDateRange.jsx';
import { eventPropertyType } from '../../data-shapes/property.js';

const PendingOrder = ({
    id,
    formattedState,
    coverImage,
    property,
    checkIn,
    checkOut,
    propertyCode,
    removePendingOrder,
    isLoading
}) => (
    <div className="PendingOrder">
        <Link
          to={`/${property.isExperience ? 'events' : 'listing'}/${propertyCode}`}
          className="PendingOrder-detail"
        >
            { coverImage && <img src={coverImage.image} alt={coverImage.caption} />}
            <div className="PendingOrder--info">
                <b className="PendingOrder--info-city">{ property.city}</b>
                <b className="PendingOrder--info-state">{ formattedState }</b>
                <div className="PendingOrder--info-date">
                    <BookingDateRange
                      checkIn={checkIn && checkIn.toISOString()}
                      checkOut={checkOut && checkOut.toISOString()}
                      alignLeft
                    />
                </div>
            </div>
        </Link>
        <div className="PendingOrder-summary">
            <div className="PendingOrder--title">{ property.caption }</div>
            <a
              className="tiny hollow button"
              onClick={() => removePendingOrder(id)}
            >
                Cancel request
                { isLoading && <Loader size="tiny" /> }
            </a>
        </div>
    </div>
);

PendingOrder.propTypes = {
    id: PropTypes.string.isRequired,
    formattedState: PropTypes.string.isRequired,
    coverImage: PropTypes.object.isRequired,
    property: eventPropertyType.isRequired,
    checkIn: PropTypes.object.isRequired,
    checkOut: PropTypes.object.isRequired,
    propertyCode: PropTypes.string.isRequired,
    isLoading: PropTypes.bool.isRequired,
    removePendingOrder: PropTypes.func.isRequired
};

const UserDashboardPendingOrders = ({ results, removePendingOrder, isLoading }) => (
    <div>
        <h2 className="column">Pending Requests</h2>
        {
            results && results.length ?
            results.map(order =>
                <PendingOrder
                  {...order}
                  isLoading={isLoading}
                  removePendingOrder={removePendingOrder}
                  key={order.id}
                />
            ) :
            <div className="UserDashboard-noresults">No pending request</div>
        }
    </div>
);

UserDashboardPendingOrders.propTypes = {
    results: PropTypes.array,
    isLoading: PropTypes.bool.isRequired,
    removePendingOrder: PropTypes.func.isRequired
};

export default UserDashboardPendingOrders;
