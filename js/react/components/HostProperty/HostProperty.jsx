import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

import { eventPropertyType } from '../../data-shapes/property.js';

import './HostProperty.scss';

import PriceEl from '../PriceEl/PriceEl.jsx';
import UserInfoContainer from '../../containers/UserInfoContainer.jsx';


const HostProperty = ({ property, hideTitle }) => {
    if (!property) {
        return null;
    }

    const ownerUrl = property.owner;

    const images = property.images.slice(0, 3).map(img => (
        <img
          key={img.small}
          className="HostProperty__image"
          src={img.small}
          alt={img.caption}
        />
    ));

    return (
        <section className="host-property">
            {!hideTitle && <h5 className="HostProperty__heading">This event is hosted at</h5>}
            <Link to={`/listing/${property.code}`} className="HostProperty__images">
                {images}
            </Link>
            <div className="HostProperty__information">
                <Link to={`/listing/${property.code}`}>
                    <h4 className="HostProperty__title">
                        {property.caption}
                    </h4>
                </Link>
                <div className="HostProperty__location">
                    {`${property.city}, ${property.state}`}
                </div>
                <hr className="HostProperty__information__hr" />
                <div className="HostProperty__owner__container">
                    { ownerUrl && <UserInfoContainer url={ownerUrl} />}
                </div>
            </div>
        </section>
    );
};

HostProperty.propTypes = {
    property: eventPropertyType,
    ownerUrl: PropTypes.string,
    hideTitle: PropTypes.bool
};

export default HostProperty;
