import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import { actions, getState as appState } from '../reducers';
import { reviewType } from './../data-shapes/review.js';
import { userPropType } from './../data-shapes/user.js';
import ButtonLoader from '../components/ButtonLoader/ButtonLoader.jsx';
import idFromURLEnd from '../lib/idFromURLEnd.js';

const mapStateToProps = (state) => {
    const userId = appState.session.userId(state);
    const user = appState.user.getUser(state, userId);

    return { user };
};

class UserDashboardReviewFormContainer extends React.Component {
    static propTypes = {
        user: userPropType,
        review: PropTypes.shape(reviewType),
        close: PropTypes.func.isRequired,
        orderUrl: PropTypes.string,
        propertyUrl: PropTypes.string,
        createOrUpdateReview: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);
        const { review } = this.props;

        this.onSubmit = this.onSubmit.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.createOrUpdateReview = this.createOrUpdateReview.bind(this);
        this.onTextChange = this.onTextChange.bind(this);

        this.state = {
            review: review && review.review,
            error: false,
            isPersisting: false
        };
    }

    onCancel() {
        this.props.close();
    }

    createOrUpdateReview() {
        const { orderUrl, propertyUrl, user, orderId } = this.props;

        const params = {
            review: this.state.review,
            associated_order: orderUrl,
            author: user.url,
            property: propertyUrl,
            rating: {
                communication: 0,
                accuracy: 0,
                cleanliness: 0,
                location: 0,
                check_in: 0,
                value: 0
            }
        };
        this.setState({isPersisting: true});
        this.props.createOrUpdateReview(params, orderId, idFromURLEnd(propertyUrl)).then(() => {
            this.onCancel()
        });
    }

    onSubmit(e) {
        e.preventDefault();
        const { review } = this.state;
        if (review && review.length) {
            this.setState({ error: false });
            return this.createOrUpdateReview()
        } else {
            this.setState({ error: true });
        }
    }

    onTextChange(e) {
        this.setState({ review: e.target.value });
    }

    render() {
        const { error, isPersisting } = this.state;
        return (
            <form onSubmit={this.onSubmit}>
                <textarea
                  rows="2"
                  style={{ border: '1px solid #cacaca', fontSize: '.85rem', marginBottom: (error ? 0 : '1rem') }}
                  placeholder="Leave a review"
                  value={this.state.review}
                  onChange={this.onTextChange}
                />
                { error && <div className="JoinCommunityRequest--error">Enter Review</div> }
                <ButtonLoader size="tiny" showSpinner={isPersisting} disabled={isPersisting} type="submit">
                    Add Review
                </ButtonLoader>
            </form>
        );
    }
}


export default connect(mapStateToProps, {
    createOrUpdateReview: actions.review.createOrUpdateReview
})(UserDashboardReviewFormContainer);
