import moment from 'moment';
import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import { actions, getState as appState } from '../../reducers';
import { reviewType } from './../../data-shapes/review.js';
import Button from './../Button/Button.jsx';
import UserDashboardReviewFormContainer from './../../containers/UserDashboardReviewFormContainer.jsx';
import idFromURLEnd from '../../lib/idFromURLEnd.js';

import './UserDashboardReview.scss';

const mapStateToProps = (state, { orderId, propertyUrl }) => {
    const review = appState.review.getReviewsByOrderId(state, orderId, idFromURLEnd(propertyUrl));

    return { review };
};

class UserDashboardReview extends React.Component {
    static propTypes = {
        propertyId: PropTypes.number.isRequired,
        from: PropTypes.object,
        until: PropTypes.object,
        orderUrl: PropTypes.string,
        propertyUrl: PropTypes.string,
        review: PropTypes.shape(reviewType),
        fetchReviews: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        this.triggerCancelEdit = this.triggerCancelEdit.bind(this);
        this.triggerEdit = this.triggerEdit.bind(this);

        this.state = {
            canEdit: false
        };
    }

    componentDidMount() {
        this.props.fetchReviews(this.props.propertyId);
    }

    triggerEdit() {
        this.setState({ canEdit: true });
    }

    triggerCancelEdit() {
        this.setState({ canEdit: false });
    }

    render() {
        const { canEdit } = this.state;
        const { from, until, review, orderUrl, propertyUrl, orderId } = this.props;
        const dayDifference = Math.round((until - from) / (1000 * 60 * 60 * 24));

        let stayString;
        if (dayDifference === 1 || dayDifference === 0) {
            stayString = `On ${moment(from).format('Do MMM, YYYY')}`;
        } else {
            stayString = `Stayed ${dayDifference} nights.`;
        }

        return (
            <div className="UserReview">
                <div className="UserReview--title">
                    {stayString}
                </div>
                {
                    !review &&
                    <UserDashboardReviewFormContainer
                      orderUrl={orderUrl}
                      orderId={orderId}
                      propertyUrl={propertyUrl}
                      close={this.triggerCancelEdit}
                    />
                }
                {
                    canEdit && review &&
                    <UserDashboardReviewFormContainer
                      review={review}
                      orderId={orderId}
                      orderUrl={orderUrl}
                      propertyUrl={propertyUrl}
                      close={this.triggerCancelEdit}
                    />
                }
                {
                    review && !canEdit &&
                    <div className="UserReview">
                        <label htmlFor="review">{ review.review }</label>
                        <Button size="tiny" onClick={this.triggerEdit}>Edit Review</Button>
                    </div>
                }
            </div>
        );
    }
}

export default connect(mapStateToProps, {
    fetchReviews: actions.review.fetchReviews
})(UserDashboardReview);
