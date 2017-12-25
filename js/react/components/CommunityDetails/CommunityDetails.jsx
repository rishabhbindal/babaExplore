import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

import TruncatedText from './../TruncatedText/TruncatedText.jsx';
import CommunityUser from './../CommunityUser/CommunityUser.jsx';
import SocialShare from './../SocialShare/SocialShare.jsx';
import JoinCommunityContainer from './../../containers/JoinCommunityContainer.jsx';
import { imageSetPropType } from './../../data-shapes/image.js';

import './CommunityDetails.scss';

const CommunityDetails = ({ name, information, groupAdmins, members, coverImage = {} }) => (
    <div className="CommunityDetails">
        <div className="CommunityHeader" style={{ backgroundImage: `url(${coverImage.custom})` }}>
            <div className="row" style={{ position: 'relative', zIndex: 10 }}>
                <div className="CommunityHeader-title">
                    <h1>{ name }</h1>
                </div>
            </div>
        </div>
        <SocialShare />
        <div className="CommunityInfo row">
            <div className="CommunityInfo-summary">
                <TruncatedText text={information} limit={80} quoted />
                <div className="clearfix" />
                <JoinCommunityContainer communityName={name} />
            </div>
            <div className="CommunityInfo-TopMembers">
                <h6>Top Members</h6>
                {
                    members.slice(0, 8).map(url =>
                        <Link
                          to={`/community/${name}/topmembers`}
                          key={url}
                          className="CommunityInfo--TopMember"
                        >
                            <CommunityUser url={url} key={url} onlyAvatar />
                        </Link>
                    )
                }

            </div>
            <div className="CommunityInfo-owners">
                <h6>Managed By</h6>
                {
                    groupAdmins.slice(0, 2).map(adminUrl =>
                        <Link
                          to={`/community/${name}/admins`}
                          key={adminUrl}
                        >
                            <CommunityUser url={adminUrl} />
                        </Link>
                    )
                }
            </div>
        </div>
    </div>
);

CommunityDetails.propTypes = {
    name: PropTypes.string,
    information: PropTypes.string,
    groupAdmins: PropTypes.arrayOf(PropTypes.string),
    members: PropTypes.arrayOf(PropTypes.string),
    coverImage: imageSetPropType
};

export default CommunityDetails;
