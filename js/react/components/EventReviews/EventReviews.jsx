import React, { PropTypes } from 'react';

import EventReview from '../Review/Review.jsx';
import { reviewType } from '../../data-shapes/review.js';

import './EventReviews.scss';

const EventReviews = ({ reviews }) => !!reviews.length && (
    <div>
        <h5 className="EventReviews__title">Guest Book</h5>
        <ul className="EventReviews__list">
            {reviews && reviews.map((review, i) => (
                <li key={review.url}>
                    <EventReview {...review} last={i === reviews.length - 1} />
                </li>
            ))}
        </ul>
    </div>
    );

EventReviews.propTypes = {
    reviews: PropTypes.arrayOf(PropTypes.shape(reviewType))
};

export default EventReviews;
