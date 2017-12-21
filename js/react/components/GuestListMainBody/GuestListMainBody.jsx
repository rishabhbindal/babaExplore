import React, { PropTypes } from 'react';

import { eventPropertyType } from '../../data-shapes/property.js';

import Guest from '../Guest/Guest.jsx';

import './GuestListMainBody.scss';

const GuestListMainBody = ({ guests, property }) => {
    if (!property.caption) {
        return (<h6 className="GuestListMainBody__error">Event not found</h6>);
    }

    const title = property.caption &&
        <h1 className="GuestListMainBody__title"> Guest List for {property.caption}</h1>;

    return (
        <div>
            {title}
            <hr className="GuestListMainBody__hr" />
            <div className="GuestListMainBody__section">
                {guests.map(guest => <Guest key={guest.url} guest={guest} />)}
            </div>
        </div>
    );
};

GuestListMainBody.propTypes = {
    property: eventPropertyType.isRequired,
    guests: PropTypes.arrayOf(PropTypes.shape({
        name: PropTypes.string,
        profilePic: PropTypes.string,
        quote: PropTypes.string,
        url: PropTypes.string
    }))
};

export default GuestListMainBody;
