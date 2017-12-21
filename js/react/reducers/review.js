import { combineReducers } from 'redux';
import { actions as appActions, getState as appState } from './index.js';
import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';
import requestStateReducer from '../lib/requestReducerHelper.js';
import { Property, Review } from '../lib/api.js';
import { reviewTransform } from './../data-shapes/review.js';

export const types = {
    reviewsFetch: genFetchTypes('REVIEWS_FETCH'),
    createOrUpdateReview: genFetchTypes('REVIEW_CREATE_OR_UPDATE')
};

const reviewsReducer = (state = { reviews: [] }, { id, type, payload }) => {
    switch (type) {
    case types.reviewsFetch.SUCCESS: {
        const { reviews } = payload;

        return {
            ...state,
            [id]: (state[id] && state[id].length) ? state.reviews.concat(reviews) : reviews
        };
    }
    case types.createOrUpdateReview.SUCCESS: {
        const currentReviews = state[id];
        const reviewIndex = currentReviews.indexOf(currentReviews.find(r => r.url === payload.url));
        const reviews = [].concat(currentReviews);
        if (reviewIndex > 0) {
            reviews.splice(reviewIndex, 1);
        }
        reviews.push(payload);

        return {
            ...state,
            [id]: reviews
        };
    }
    case types.reviewsFetch.FAILURE:
    default:
        return state;
    }
};

const actions = {
    fetchReviews: (id, next) => dispatch =>
        dispatch(simpleJSONFetchDispatcher({
            id,
            promiseFn: () => Property.getReviews(id, next),
            actionTypes: types.reviewsFetch,
            transform: res => ({
                reviews: res.results.map(reviewTransform),
                next: res.next
            }),
            returnResponse: true
        })).then((res) => {
            res.next && dispatch(actions.fetchReviews(id, res.next));
        }),

    createOrUpdateReview: (params, orderId, id) => (dispatch, getState) => {
        const state = getState();
        const review = appState.review.getReviewsByOrderId(state, orderId, id);
        const fetchData = review ? Review.updateReview(review.url, params) : Review.createReview(params);

        const requestState = dispatch(simpleJSONFetchDispatcher({
            id,
            promiseFn: () => fetchData,
            actionTypes: types.createOrUpdateReview,
            transform: reviewTransform,
            returnResponse: true
        }));

        return requestState
            .then(() => {})
            .catch((err) => {
                dispatch(appActions.modals.showMessageModal(
                    'Error',
                    Object.values(err).join(', ')
                ));
                return Promise.resolve();
            })
            .then(() => {
                dispatch(appActions.modals.showMessageModal(
                    'Success',
                    'Review added successfully.'
                ));
                return Promise.resolve();
            });
    }
};

const getFns = {
    getReviews: (state, id) => state.reviews[id],
    getReviewsCount: (state, id) => state.reviews[id] && state.reviews[id].length,
    isFetchingReviews: (state, propertyId) =>
        state.reviewsFetchState[propertyId] && state.reviewsFetchState[propertyId].isFetching,
    hasRequestedReviews: (state, propertyId) =>
        state.reviewsFetchState[propertyId] && state.reviewsFetchState[propertyId].isInitialized,
    getReviewsByOrderId: (state, orderId, id) => {
        if (!state.reviews[id]) {
            return null;
        }
        return state.reviews[id].find(review => `${review.orderId}` === `${orderId}`);
    },
    reviewLoading: state => state.reviewsFetchState.isFetching
};

export default {
    reducer: combineReducers({
        reviewsFetchState: requestStateReducer(types.reviewsFetch),
        reviews: reviewsReducer
    }),
    actions,
    get: getFns
};
