import React, { PropTypes } from 'react';
import './TopMembers.scss';
import { userPropType } from '../../data-shapes/user.js';

import TopMember from '../TopMember/TopMember.jsx';
import Loader from '../Loader/Loader.jsx';

const TopMembers = ({ members, title }) => {
    return (
        <div>
            <section className="CommunitiesHeader">
                <div className="row">
                    <div className="CommunitiesHeader--title">
                        <h1>{ title }</h1>
                    </div>
                </div>
            </section>
            <hr />
            <div className="row">
                { !members && <div className="text-align--center"><Loader /></div> }
                { !!members && members.map(memberUrl => <TopMember memberUrl={memberUrl} key={memberUrl} />) }
            </div>
        </div>
    );
};

TopMembers.propTypes = {
    members: PropTypes.arrayOf(PropTypes.string),
    title: PropTypes.string.isRequired
};

export default TopMembers;
