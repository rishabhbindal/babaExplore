import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

import './EventMastHead.scss';

import Loader from '../Loader/Loader.jsx';
import UserInfo from '../UserInfo/UserInfo.jsx';
import DateInfo from '../DateInfo/DateInfo.jsx';
import { eventPropertyType } from './../../data-shapes/property.js';
import { imageSetPropType } from './../../data-shapes/image.js';
import TruncateTextBetter from '../TruncateTextBetter/TruncateTextBetter.jsx';

const EventMastHead = ({ property, mastImage, topGuests }) => {
    if (!property || !property.eventDate) {
        return (<div className="tc pa2">
            <Loader />
        </div>);
    }

    const { caption, city, eventDate, locality } = property;

    const img = mastImage && (mastImage.large || mastImage.small);

    const topGuestsSection = topGuests.length > 0 && (
        <div className="row">
            <div className="EventMastHead__info__guests">
                <h6 className="EventMastHead__heading">Attending</h6>
                {
                    topGuests.map((g, i) => (
                        <div key={`${g.name || ''}-${i}`} className="EventMastHead__UserInfo">
                            <UserInfo
                              img={g.profilePic}
                              name={(g.name || '').split(' ')[0]}
                              quote={<TruncateTextBetter text={g.quote} lines={5} quoted />}
                              center={topGuests.length === 1}
                            />
                        </div>
                    ))
                }

                <div className="EventMastHead__see_all">
                    <Link to={`/events/${property.code}/guestlist`} className="EventMastHead__button button hollow">See all guests</Link>
                </div>
            </div>
        </div>
    );

    return (
        <div className="EventMastHead">
            {img && (<div
              className="EventMastHead__img"
              style={{
                  backgroundImage: `url(${img})`
              }}
            />)}
            <div className="EventMastHead__info">
                <div className="EventMastHead__info__intro">
                    <h1 className="EventMastHead__info__intro_h1">{caption}</h1>
                    <h6 className="EventMastHead__heading">
                        <div className="EventMastHead__heading_span">
                            <DateInfo date={eventDate} />
                        </div>
                        <span className="EventMastHead__heading_span">
                            {locality && `${locality},`} {city}
                        </span>
                    </h6>
                    <p className="EventMastHead__info__desc">{mastImage && mastImage.description}</p>
                </div>

                {topGuestsSection}
            </div>
        </div>
    );
};
EventMastHead.propTypes = {
    mastImage: imageSetPropType,
    property: eventPropertyType,
    topGuests: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        quote: PropTypes.string
    }))
};

export default EventMastHead;
