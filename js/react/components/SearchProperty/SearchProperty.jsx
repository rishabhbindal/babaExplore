import React from 'react';
import { Link } from 'react-router-dom';

import { userPropType } from '../../data-shapes/user.js';

import TruncatedText from '../TruncatedText/TruncatedText.jsx';
import UserInfo from '../UserInfo/UserInfo.jsx';
import PropertyTag from '../PropertyTag/PropertyTag.jsx';
import PropertyImagesCollage from '../PropertyImagesCollage/PropertyImagesCollage.jsx';
import PropertyImagesModal from '../PropertyImagesModal/PropertyImagesModal.jsx';
import PropertyImagesModalContainer from '../../containers/PropertyImagesModalContainer.jsx';
import './SearchProperty.scss';

const SearchProperty = ({ property, owner, showPropertyImageModal, tiggerPropertyImageModal }) => {
    const { code, listingType, location, caption, availableTo, icons, dailyPrice, images, amenities } = property;
    console.log('property');
    console.log(property);
    let amenitiesEl;
    if (amenities.length) {
        // amenitiesEl = (
        //     <div className="known-for-block">
        //         <div className="font-size-10">KNOWN FOR</div>
        //         <hr />
        //         <ul className="feature__bullets">
        //             {amenities.splice(0, 3).map((icon) => (<span className="font-size-12">{icon}, </span>))} 
        //         </ul>
        //     </div>
        // );

        amenitiesEl = (
            <div className="known-for-block">
                <div className="font-size-10">KNOWN FOR</div>
                <hr />
                <ul className="feature__bullets">
                    <span className="font-size-12">Excellent Food </span> 
                    <span className="font-size-12">Medical Firedly </span> 
                </ul>
            </div>
        );


    }

    let priceEl = <div className="price">Free</div>;
    if (dailyPrice) {
        priceEl = (
            <div className="property-price-block text-right">
                <div className="property-price">₹{dailyPrice}</div>
                <div className="property-price-tag">onwards</div>
            </div>
        );
    }

    return (
        <li className="search-result-row">
            {
                showPropertyImageModal && (
                    <PropertyImagesModalContainer property={property}/>
                )   
            }
            <div className="search-result-card">
                <PropertyImagesCollage property={property} tiggerPropertyImageModal={tiggerPropertyImageModal}/>
                <div className="card-details">
                    <div className="display-flex-column">
                        <div className="display-flex-between property-details">
                            <div className="display-flex-column">
                                <div className="display-flex">
                                    <p className="font-size-20">{caption}</p>
                                    <span className="property-type">HOME STAY</span>
                                </div>
                                <p className="property-location">
                                    { location } &nbsp;
                                    <img src="images/ic-next-cheveron.svg" />
                                </p>
                            </div>
                            {priceEl}
                        </div>
                        <div className="display-flex-between check-details">
                            {amenitiesEl}
                            <div className="details-button">Check details</div>
                        </div>
                    </div>
                    {owner && 
                        <UserInfo
                          img={owner.profilePic}
                          name={owner.name}
                          quote={<TruncatedText text={owner.ownerPropertyIntro} limit={160} />}
                          fullWidth
                        />
                    }
                </div>
            </div>
        </li>
    );
};

export default SearchProperty;
