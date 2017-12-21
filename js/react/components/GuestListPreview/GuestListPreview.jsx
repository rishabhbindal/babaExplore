import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

import Loader from '../Loader/Loader.jsx';
import UserAvatar from '../UserAvatar/UserAvatar.jsx';

import './GuestListPreview.scss';

const GuestListPreview = ({ guests, isLoading, code }) => {
    if (isLoading) {
        return (
            <div className="text-align--center">
                <Loader size="large" />
            </div>
        );
    }
    if (!guests) {
        return null;
    }

    const avatars = guests.slice(0, 6).map((g, i) => (
        <div key={i} className="GuestListPreview__avatar">
            <UserAvatar
              size="medium"
              img={g.profilePic}
              desc={g.name}
            />
        </div>
    ));


    let moreGuests = null;
    if (guests.length > 6) {
        moreGuests = (
            <Link
              to={`/events/${code}/guestlist`}
              className="GuestListPreview__link__container"
            >
                <UserAvatar img="/images/user.jpg" />
                <div className="GuestListPreview__overlay">
                    <span className="GuestListPreview__overlay__span">
                        +{guests.length - 6}
                    </span>
                </div>
            </Link>
        );
    }

    return (
        <div className="GuestListPreview">
            {avatars}
            {moreGuests}
        </div>
    );
};
GuestListPreview.propTypes = {
    isLoading: PropTypes.bool,
    guests: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        profilePic: PropTypes.string
    })),
    code: PropTypes.string
};

export default GuestListPreview;
