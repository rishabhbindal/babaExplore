/**
 * Given a type actions, generate reducers to keep track of the
 * different stats of request.
 */

export default typeActions => (state = {}, { type, id, payload = {} }) => {
    const promiseId = payload.meta && payload.meta.promiseId;

    if (!id) {
        /**
         * State directly keeps the information about the request
         * state.
         */
        switch (type) {
        case typeActions.PENDING:
            return {
                ...state,
                promiseId,
                isFetching: true,
                error: null
            };
        case typeActions.SUCCESS:
            return {
                ...state,
                promiseId,
                isFetching: false,
                isInitialized: true,
                error: null
            };
        case typeActions.FAILURE:
            return {
                ...state,
                promiseId,
                isFetching: false,
                error: payload
            };
        default:
            return state;
        }
    }

    switch (type) {
    case typeActions.PENDING:
        return {
            ...state,
            [id]: {
                ...(state[id] || {}),
                promiseId,
                isFetching: true,
                error: null
            }
        };
    case typeActions.SUCCESS:
        return {
            ...state,
            [id]: {
                ...(state[id] || {}),
                promiseId,
                isFetching: false,
                isInitialized: true,
                error: null
            }
        };
    case typeActions.FAILURE:
        return {
            ...state,
            [id]: {
                ...(state[id] || {}),
                promiseId,
                isFetching: false,
                error: payload
            }
        };
    default:
        return state;
    }
};
