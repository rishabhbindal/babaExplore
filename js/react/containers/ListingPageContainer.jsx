import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { appState, appActions } from '../reducers';

import ListingPage from '../components/ListingPage/ListingPage.jsx';
import ListingHelmet from '../components/ListingHelmet.jsx';

const mapStateToProps = (state, { match }) => {
    const propertyCode = match.params.propertyCode;
    const property = appState.property.getProperty(state, propertyCode);
    const isFetching = appState.property.isFetchingProperty(state, propertyCode || '');

    let reviewsCount = 0;
    if (property) {
        reviewsCount = appState.review.getReviewsCount(state, property.id);
    }

    const cancellationPolicies = appState.event.getCancellationPolicies(state);

    return { property, propertyCode, reviewsCount, cancellationPolicies, isFetching };
};

class ListingPageContainer extends React.Component {
    static defaultProps = {
        isFetching: false
    }

    static propTypes = {
        isFetching: PropTypes.bool,
        cancellationPolicies: PropTypes.array,
        propertyCode: PropTypes.string.isRequired,
        fetchCancellationPolicies: PropTypes.func.isRequired,
        fetchProperty: PropTypes.func.isRequired,
        setCurrentProperty: PropTypes.func.isRequired
    }

    componentWillMount() {
        this.fetchData();
        this.props.setCurrentProperty(this.props.propertyCode);

        if (!this.props.cancellationPolicies || this.props.cancellationPolicies.length === 0) {
            this.props.fetchCancellationPolicies();
        }
    }

    fetchData(newProps) {
        const props = newProps || this.props;

        const { propertyCode, property } = props;
        if (propertyCode && !property) {
            return this.props.fetchProperty(propertyCode);
        }

        return Promise.resolve();
    }

    render() {
        return (
            <div>
                <ListingHelmet property={this.props.property} />
                <ListingPage {...this.props} />
            </div>
        );
    }
}

export default connect(mapStateToProps, {
    fetchCancellationPolicies: appActions.event.fetchCancellationPolicies,
    fetchProperty: appActions.property.fetchProperty,
    setCurrentProperty: appActions.property.setCurrentProperty
})(ListingPageContainer);
