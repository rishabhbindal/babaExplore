import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import { appState, appActions } from '../reducers';
import EventReviews from '../components/EventReviews/EventReviews.jsx';
import Button from '../components/Button/Button.jsx';

const mapStateToProps = (state, { propertyId }) => {
    const reviews = appState.review.getReviews(state, propertyId);
    return { reviews };
};

class ReviewsContainer extends React.Component {
    static propTypes = {
        propertyId: PropTypes.number.isRequired,
        fetchReviews: PropTypes.func.isRequired,
        reviews: PropTypes.arrayOf(PropTypes.object)
    }

    static defaultProps = {
        reviews: []
    }

    constructor(props) {
        super(props);

        this.showAll = this.showAll.bind(this);
        this.state = {
            showAll: false
        };
    }

    componentWillMount() {
        this.fetchData();
    }

    fetchData(newProps) {
        const props = newProps || this.props;
        return this.props.fetchReviews(props.propertyId);
    }

    showAll() {
        this.setState({ showAll: true });
    }

    render() {
        const { reviews } = this.props;
        const visibleReviews = 3;

        if (!reviews || !Array.isArray(reviews) || !reviews.length) {
            return null;
        }

        let reviewsShown = reviews.slice();
        reviewsShown.reverse();
        let isSliced = false;
        if (!this.state.showAll && reviewsShown.length > visibleReviews) {
            isSliced = true;
            reviewsShown = reviewsShown.slice(0, visibleReviews);
        }

        return (
            <div className="ReviewsContainer">
                <EventReviews reviews={reviewsShown} />
                {isSliced && !this.state.showAll &&
                    (
                        <div className="mv3 tc">
                            <Button onClick={this.showAll}>More reviews</Button>
                        </div>
                    )
                }
            </div>
        );
    }
}

export default connect(mapStateToProps, {
    fetchReviews: appActions.review.fetchReviews
})(ReviewsContainer);
