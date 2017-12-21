import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

import './HomePageSpecialEvent.scss';

const HomePageSpecialEvent = ({ event }) => {

    const canShow = (event && event.specialEventImage);

    const specialEventBanner = canShow && (
    <Link to={`/events/${event.property_code}`} className="banner-link">
        <img src={event.specialEventImage.src} alt={event.specialEventImage.caption} title={event.specialEventImage.caption} />
    </Link>
  );

    return (
        <section>
            {
        (canShow && (
        <div className="row medium-grid">
            <div className="event-banner">
                <div className="section-title">
                    <h2>Exclusive events happening at our host's houses</h2>
                </div>
                <div className="event-banner">
                    <div className="main-banner">
                        { specialEventBanner }
                    </div>
                    <Link to="/events" className="more-link"><span className="text">see more events</span></Link>
                </div>
            </div>
        </div>))
      }
        </section>
    );
};

export default HomePageSpecialEvent;
