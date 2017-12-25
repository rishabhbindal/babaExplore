import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

import TruncatedText from '../TruncatedText/TruncatedText.jsx';

import './EventListing.scss';

const EventItem = ({ coverImage = {}, clickableUrl, propertyCode, caption, description }) => (
    <li className="EventListing--item medium-3 small-12 column" style={{ float: 'left' }}>
        <Link to={clickableUrl || `/events/${propertyCode}`}>
            {
                coverImage && <img src={coverImage.src} alt={coverImage.caption} />
            }
        </Link>
        <div>
            <h5><Link to={clickableUrl || `/events/${propertyCode}`}>{caption}</Link></h5>
            { description && <TruncatedText text={description} limit={150} /> }
        </div>
    </li>
);

EventItem.propTypes = {
    caption: PropTypes.string,
    coverImage: PropTypes.object,
    description: PropTypes.string,
    propertyCode: PropTypes.string
};

const EventListing = ({ results }) => (
    <div>
        <div className="row row-fluid">
            <ul className="EventListing-items">
                { results && results.map(event => <EventItem {...event} key={event.url} />) }
            </ul>
        </div>
    </div>
);

EventListing.propTypes = {
    results: PropTypes.arrayOf(PropTypes.object)
};

export default EventListing;
