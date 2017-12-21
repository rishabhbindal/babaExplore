import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

import TruncatedText from '../TruncatedText/TruncatedText.jsx';
import './CommunityInfo.scss';

const CommunityInfo = ({ name, information, image }) => {

    const img = image || {};
    return (
        <div className="CommunityInfo-item">
            <Link to={`/community/${name}`} className="CommunityInfo-title">
                <span className="image">
                    {img && (<img src={img.custom} alt={img.caption} className="CommunityInfo-image" />)}
                </span>
                <h5>{name}</h5>
            </Link>
            <small>
                <TruncatedText text={information} limit={80} />
            </small>
            <div className="clearfix" />
        </div>
    );
};

CommunityInfo.propTypes = {
    name: PropTypes.string,
    information: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.object)
};

export default CommunityInfo;
