import React, { PropTypes } from 'react';

import TruncatedText from '../TruncatedText/TruncatedText.jsx';

import './Guest.scss';

const Guest = ({ guest }) => (
    <div className="Guest__item">
        <img
          className="Guest__pic"
          src={guest.profilePic}
          alt={guest.name}
        />
        <h5 className="Guest__name"> {guest.name.split(' ')[0]} </h5>
        <p> {<TruncatedText text={guest.quote} limit={80} />} </p>
        {
            guest.instances > 1 &&
            <div className="Guest__bookingCount">
                {guest.instances} Bookings
            </div>
        }
    </div>
);

Guest.propTypes = {
    guest: PropTypes.shape({
        name: PropTypes.string,
        profilePic: PropTypes.string,
        quote: PropTypes.string
    })
};

export default Guest;
