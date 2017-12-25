import cls from 'classnames';
import React from 'react';

import './Review.scss';

import { reviewType } from '../../data-shapes/review.js';
import TruncateTextBetter from '../TruncateTextBetter/TruncateTextBetter.jsx';
import UserAvatar from '../UserAvatar/UserAvatar.jsx';

const EventReview = ({ author, lastUpdated, review, last }) => {
    const avatar = (
        <UserAvatar
          img={author.thumbnail}
          desc={author.name}
          size="medium"
        />
    );

    const mainClass = cls('EventReview__main', { 'EventReview__main--last': last });

    return (
        <div className="EventReview__wrapper">
            <div className="EventReview__avatar EventReview__avatar--medium">
                {avatar}
            </div>
            <div className={mainClass}>
                <div className="EventReview__reviewer">
                    <div className="EventReview__avatar EventReview__avatar--mobile">
                        {avatar}
                    </div>
                    <div className="EventReview__name">{author.name}</div>
                    <div className="EventReview__stayDate">
                        {lastUpdated}
                    </div>
                </div>
                <div className="EventReview__content">
                    <TruncateTextBetter lines={3} text={review} />
                </div>
            </div>
        </div>
    );
};

EventReview.propTypes = reviewType;


export default EventReview;
