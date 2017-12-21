import React from 'react';
import { Link } from 'react-router-dom';

import { userPropType } from '../../data-shapes/user.js';

import TruncatedText from '../TruncatedText/TruncatedText.jsx';
import UserInfo from '../UserInfo/UserInfo.jsx';
import PropertyTag from '../PropertyTag/PropertyTag.jsx';
import PropertyImagesCollage from '../PropertyImagesCollage/PropertyImagesCollage.jsx';

import './SearchProperty.scss';

const SearchProperty = ({ property, owner }) => {
    const { code, listingType, location, caption, availableTo, icons, dailyPrice, images } = property;

    let aminitiesEl;
    if (icons.length) {
        aminitiesEl = (
            <div className="known-for-block">
                <div className="font-size-10">KNOWN FOR</div>
                <ul>
                    {
                        icons.splice(0, 3).map((icon, id) =>
                            <span className="font-size-12">{icon.name}, </span>
                        )
                    }
                </ul>
                <hr />
            </div>
        );
    }

    let priceEl = <div className="price">Free</div>;
    if (dailyPrice) {
        priceEl = (
            <div className="property-price-block">
                <div className="property-price">₹{dailyPrice}</div>
                <div className="font-size-10">onwards</div>
            </div>
        );
    }

    let userInfoEl;
    if (owner) {
        userInfoEl = (
            <div className="host-details">
                <div className="primary-details">
                    <div>
                        <img className="host-image" src={owner.profilePic} />
                    </div>
                    <div className="name-block">
                        <div className="font-size-14">{owner.name}</div>
                        <div className="font-size-11">Local host</div>
                    </div>
                </div>
                <div className="host-description">
                    {owner.ownerPropertyIntro}
                </div>
            </div>
        );
    }

    return (
        <li className="pl-item">
            <div className="search-result-card">
                <PropertyImagesCollage property={property} />
                <div className="card-details">
                    <div class="search-result-card">
                        <div className="display-flex-between">
                            <div className="display-flex">
                                <p className="font-size-20">{caption}</p>
                                <span className="property-type">HOME STAY</span>
                            </div>
                            {priceEl}
                        </div>
                        <p className="property-location">{ location }</p>
                        <div className="display-flex-between margin-top-20">
                            {aminitiesEl}
                            <div className="details-button">Check details</div>
                        </div>
                        {userInfoEl}
                    </div>
                </div>
            </div>
        </li>
    );
};

export default SearchProperty;
