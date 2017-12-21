import React from 'react';
import { Link } from 'react-router-dom';

import { eventPropertyType } from '../../data-shapes/property.js';
import { userPropType } from '../../data-shapes/user.js';

import PropertyTag from '../PropertyTag/PropertyTag.jsx';

const PreviewProperty = ({ property, owner }) => {
    if (!property) {
        return null;
    }

    const { caption, listingType, location, coverImage } = property;

    const hasProfilePic = owner && owner.profilePic && owner.profilePic.length > 21;
    const ownerProfilePic = hasProfilePic ? owner.profilePic : 'images/user.jpg';

    return (
        <div className="fl-item">
            <Link to={`/listing/${property.code}`}>
                <div className="image">
                    <PropertyTag label={listingType} />
                    <img src={coverImage.src} alt={coverImage.caption} />
                </div>
                <div className="fl-content">
                    <div className="avatar-holder">
                        { owner && (<div className="avatar">
                            <div className="image">
                                <img src={ownerProfilePic} alt={owner.name} />
                            </div>
                            { (owner.name && <span className="name">{owner.name}</span>) }
                        </div>)
                    }
                    </div>
                    <h4 className="title">{caption}</h4>
                    <div className="location">{location}</div>
                </div>
            </Link>
        </div>
    );
};

PreviewProperty.propTypes = {
    property: eventPropertyType,
    owner: userPropType
};

export default PreviewProperty;
