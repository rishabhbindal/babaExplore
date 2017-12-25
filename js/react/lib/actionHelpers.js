import uuid from 'uuid';

import { types as networkErrTypes } from '../reducers/network.js';
import { deleteUserBrowserSession } from './session.js';

/**
 * Creates actions representing the three states of a fetch operation.
 *
 * E.g:
 *
 *   > genFetchTypes('LOGIN');
 *
 * returns:
 *
 *   > { FETCH: 'LOGIN_FETCH', SUCCESS: 'LOGIN_SUCCESS', FAILURE: 'LOGIN_FAILURE' }
 */
export const genFetchTypes = typePrefix =>
    ['PENDING', 'SUCCESS', 'FAILURE']
    .map(t => [t, `${typePrefix}_${t}`])
    .reduce((acc, t) => Object.assign({}, acc, { [t[0]]: t[1] }), {});

const dispatchWithId = (dispatch, id) => obj =>
      dispatch({ ...obj, ...(id ? { id } : {}) });

/**
 * Helper to dispatch actions and transform data, for JSON api
 * requests.
 *
 * @param {string} [id] - Used to uniquely identify request
 * actions. `id` is passed as parameter with all the asyn actions
 * dispatched
 *
 * @param {() => Promise} promiseFn - The request around which actions
 * are dispatched.
 *
 * @param {object} actionTypes - Action type constants. Should have
 * SUCCESS, FAILURE constants.
 *
 * @param {function} dispatch react-redux dispatch method.
 *
 * @param {function} [transform] - Transform for successful response.
 *
 * @return {Promise} - The transformed success/error response.
 *
 * Starts by calling the promiseFn. If the function resolves and the
 * returned response is a 200, applies the transformFn to the returned
 * JSON. Finally dispatches the action contained in
 * actionTypes.SUCCESS with the transformed JSON as payload.
 *
 * On failure, dispatches the action contained in actionTypes.FAILURE
 * with the optionally transformed error as the payload. The format
 * for the error payload is { errors: [array, of, errors] }. Each
 * error in the array can be any type, we don't care. As long as
 * whoever is using the object downstream deals with it properly.
 */
export const simpleJSONFetchDispatcher = ({
    actionTypes,
    id,
    promiseFn,

    returnResponse = false,
    dispatchNetworkErrors = true,
    transform = res => res,
    errorTransform = err => (err && err.message) || err
}) => (dispatch) => {
    const promiseId = uuid.v4();
    const dispatchAction = dispatchWithId(dispatch, id);

    /**
     * { type: '', promiseId: '', id?: '' }
     */

    dispatchAction({
        type: actionTypes.PENDING,
        meta: { promiseId }
    });

    const promise = promiseFn()
          .then((res) => {
              if (!res.error) {
                  return res.payload;
              }

              if (process.env.NODE_ENV !== 'production') {
                  // eslint-disable-next-line
                  console.error(`${actionTypes.FAILURE}: ${res.type}: ${res.payload}`);
              }

              if (dispatchNetworkErrors) {
                  dispatch({
                      type: networkErrTypes.REQUEST_ERROR,
                      payload: res.payload
                  });
              }

              if (res.status === 403) {
                  deleteUserBrowserSession();
                  window.location.reload(false);
              }

              if (res.type === 'NETWORK_ERROR') {
                  throw res.payload;
              }

              throw new Error(res);
          })
          .then((res) => {
              dispatchAction({
                  payload: transform(res),
                  type: actionTypes.SUCCESS
              });

              return Promise.resolve(returnResponse ? transform(res) : null);
          })
          .catch((error) => {
              if (process.env.NODE_ENV !== 'production') {
                  if (error && error.stack) {
                      // eslint-disable-next-line no-console
                      console.error(error.stack);
                  } else {
                      // eslint-disable-next-line no-console
                      console.error('An error occurred while fetching a request', error);
                  }
              }
              dispatchAction({
                  type: actionTypes.FAILURE,
                  error: errorTransform(error)
              });

              throw error;
          });

    return promise;
};
