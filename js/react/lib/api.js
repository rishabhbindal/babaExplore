import fetch from 'isomorphic-fetch';

import apiPathGen from '../../../config/api.es6.js';
import { getUserSessionToken } from './session.js';
import { imageTypes } from '../constants/images.js';

const isBackend = process.env.ELT_IS_NOT_BROWSER === 'true';

const apiPaths = apiPathGen(isBackend ? process.env.ELT_HOST_URL : '');

const toQuery = params => Object.keys(params)
      .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
      .join('&');

// use this default headers thing to not pass authentication tokens from the host
// order payment page
const getDefaultHeaderOptions = (formData, auth = true) => {
    const header = {
        Accept: 'application/json'

    };

    if (!formData) {
        header['Content-Type'] = 'application/json';
    }

    const sessionToken = getUserSessionToken();
    if (auth && sessionToken) {
        header.Authorization = `Token ${sessionToken}`;
    }

    return header;
};

const RESP_CACHE = {};

const fetchResponseWrapper = (res) => {
    if (res.ok) {
        if (res.status === 204) {
            return ({ error: false, payload: '' });
        }
        return res.json()
            .then(data => ({ error: false, payload: data }))
            .catch(() => ({
                error: true,
                type: 'PARSE_ERROR',
                payload: 'Response parsing error'
            }));
    }

    return res.json()
        .then(resp => ({
            error: true,
            type: 'NETWORK_ERROR',
            payload: resp,
            status: res.status
        }))
        .catch(() => ({
            error: true,
            type: 'NETWORK_ERROR_PLAIN',
            payload: 'Error could not be parsed',
            status: res.status
        }));
};

const fetchGetJSON = (url, params, { cache } = {}) => {
    const opts = {
        headers: getDefaultHeaderOptions()
    };

    const urlWithParams = !params ? url : `${url}?${toQuery(params)}`;
    if (cache && RESP_CACHE[urlWithParams]) {
        return Promise.resolve(RESP_CACHE[urlWithParams]);
    }

    return fetch(urlWithParams, opts)
        .then(fetchResponseWrapper)
        .then((data) => {
            RESP_CACHE[urlWithParams] = data;
            return data;
        });
};

const fetchPostJSON = (url, params, auth = true) => {
    const opts = {
        headers: getDefaultHeaderOptions(false, auth),
        method: 'POST',
        body: params && JSON.stringify(params)
    };

    return fetch(url, opts).then(fetchResponseWrapper);
};

const fetchPutJSON = (url, params, auth = true) => {
    const opts = {
        headers: getDefaultHeaderOptions(null, auth),
        method: 'PUT',
        body: params && JSON.stringify(params)
    };

    return fetch(url, opts).then(fetchResponseWrapper);
};

const fetchPatchJSON = (url, params) =>
      fetch(url, {
          method: 'PATCH',
          headers: getDefaultHeaderOptions(),
          body: params && JSON.stringify(params)
      }).then(fetchResponseWrapper);

const fetchPostForm = (url, params, auth = true) =>
      fetch(url, {
          method: 'POST',
          headers: auth ? getDefaultHeaderOptions(true, auth) : {},
          body: params
      }).then(fetchResponseWrapper);

const fetchDeleteJSON = url =>
      fetch(url, {
          method: 'DELETE',
          headers: getDefaultHeaderOptions()
      }).then(fetchResponseWrapper);

const fetchPutForm = (url, params) =>
    fetch(url, {
        headers: getDefaultHeaderOptions(true),
        method: 'PUT',
        body: params
    }).then(fetchResponseWrapper);

const uploadPropertyImagePath = (type) => {
    if (type === imageTypes.PROPERTY || type === imageTypes.BOOKABLE) {
        return apiPaths.propertyimage;
    }
    // else if (type == imageTypes.GEO){
    //     return apiPaths.geoimage;
    // }
};

/**
 * App Config
 */
export const AppConfig = {
    get: () => fetchGetJSON(apiPaths.appconfig, null, {
        cache: true
    })
};

export const Groups = {
    get: params => fetchGetJSON(apiPaths.elt_groups, params, { cache: true }),
    getList: () => fetchGetJSON(apiPaths.elt_groups, { status: 'PUBLISHED', brief: true }, { cache: true }),
    groupRequests: params => fetchGetJSON(apiPaths.elt_group_request, params),
    createGroupRequest: params => fetchPostJSON(apiPaths.elt_group_request, params)
};

/**
 * Property details
 */
export const Property = {
    createProperty: data => fetchPostJSON(apiPaths.properties, data),
    get: params => fetchGetJSON(apiPaths.properties, params),
    getGuests: (propertyId, eventDate, next) => !next ?
    fetchGetJSON(apiPaths.guests, {
        property: propertyId,
        date_from: eventDate,
        date_until: eventDate
    }) : fetchGetJSON(next),
    getAvailability: (id, eventDate) => fetchGetJSON(apiPaths.propertyAvailability(id), {
        check_in: eventDate,
        check_out: eventDate
    }),
    getReviews: (propertyId, next) => !next ?
        fetchGetJSON(apiPaths.review, { property: propertyId }) :
        fetchGetJSON(next),
    byUrl: url => fetchGetJSON(url),
    getCancellationPolicies: next => fetchGetJSON(next || apiPaths.cancellationPolicy, {}, { cache: true }),
    fetchLocalities: location => fetchGetJSON(apiPaths.portalCities, location),
    fetchWaitingListStatus: bookableId => fetchGetJSON(`${apiPaths.waitingList}${bookableId}/`),
    joinWaitingList: (email, bookable_item) => fetchPostJSON(apiPaths.waitingList, { email, bookable_item }),
    addPropertyImage: (image_data, propertyId, imageType) => fetchPostForm(`${uploadPropertyImagePath(imageType)}?id=${propertyId}`, image_data),
    updatePropertyImage: (image_data, imageId, imageType) => fetchPutForm(`${uploadPropertyImagePath(imageType)}${imageId}/`, image_data),
    deletePropertyImage: (imageId, imageType) => fetchDeleteJSON(`${uploadPropertyImagePath(imageType)}${imageId}/`),
    addPropertyPanoramaImage: imageData => fetchPostForm(apiPaths.property360image, imageData),
    addPropertyVideo: videoData => fetchPostJSON(apiPaths.propertyvideo, videoData),
    updatePropertyDetails: (data, propertyId) => fetchPatchJSON(`${apiPaths.propertyUrl(propertyId)}`, data),
    updateBookableDetails: bookable => fetchPatchJSON(`${apiPaths.bookableUrl(bookable.id)}`, bookable),
    fetchUnvailableDates: data => fetchGetJSON(apiPaths.unavailable_booking, data),
    updateUnvailableDates: data => fetchPostJSON(apiPaths.unavailable_booking, data),
    deleteUnavailableDates: id => fetchDeleteJSON(`${apiPaths.unavailable_booking}/${id}/`),
    fetchSpecialPrices: data => fetchGetJSON(apiPaths.price, data),
    updateSpecialPrice: data => fetchPostJSON(apiPaths.price, data),
    modifySpecialPrice: (id, data) => fetchPutJSON(`${apiPaths.price}${id}/`, data),
    deleteSpecialPrice: id => fetchDeleteJSON(`${apiPaths.price}${id}/`),
    fetchBookings: data => fetchGetJSON(apiPaths.booking, data)
};

export const Phone = {
    register: phoneNo => fetchPostJSON(apiPaths.registerPhone, { phone_number: phoneNo }),
    fetch: phoneNo => fetchGetJSON(apiPaths.registerPhone, { number: phoneNo.slice(1) }),
    sendCode: id => fetchPostJSON(apiPaths.requestVerificationCode(id)),
    confirmCode: (id, verificationCode) => fetchPostJSON(apiPaths.confirmVerificationcode(id), {
        phone_verification_code: `${verificationCode}`
    })
};

/**
 * User details
 */
export const User = {
    getByURL: url => fetchGetJSON(url),
    getById: id => fetchGetJSON(`${apiPaths.users}${id}/`),
    getByLookup: data => fetchGetJSON(apiPaths.users, data),
    register: data => fetchPostForm(apiPaths.users, data),
    putUserData: (data, id) => fetchPutJSON(`${apiPaths.users}${id}/`, data),
    login: data => fetchPostJSON(apiPaths.login, data),
    fbLogin: token => fetchPostJSON(apiPaths.facebook, token),
    logout: () => fetchPostJSON(apiPaths.logout),
    resetPassword: data => fetchPostJSON(`${apiPaths.users}reset_password/`, data),
    updateUserData: (data, id) => fetchPutForm(`${apiPaths.users}${id}/`, data),
    changePassword: data => fetchPostJSON(`${apiPaths.users}change_password/`, data),
    testUser: () => fetchGetJSON(apiPaths.portal_test),
    deactivateUser: id => fetchPostJSON(apiPaths.deactivateUser(id), { is_active: false })
};

export const Order = {
    getOrder: id => fetchGetJSON(apiPaths.orderUrl(id)),
    create: propertyId => fetchPostJSON(apiPaths.love, {
        property: apiPaths.propertyUrl(propertyId)
    }),
    checkExistingOrder: propertyId => fetchGetJSON(apiPaths.love, {
        property_id: propertyId
    }),
    completeBooking: (bookingId, params) =>
        fetchPutJSON(apiPaths.orderUrl(bookingId), params),
    deleteBooking: bookingId => fetchDeleteJSON(apiPaths.orderUrl(bookingId)),
    resetOrder: loveId => fetchDeleteJSON(apiPaths.loveUrl(loveId)),
    getPropertyLove: id => fetchGetJSON(apiPaths.love, { property_id: id }),
    checkAvailability: (id, params) => fetchPatchJSON(apiPaths.loveAvailability(id), params),
    placeOrder: params => fetchPostJSON(apiPaths.order, params),
    existingLoveRequests: params => fetchGetJSON(apiPaths.love, params),
    getOrders: params => fetchGetJSON(apiPaths.order, params),
    cancelOrder: id => fetchPostJSON(`${apiPaths.order}${id}/cancel/`, {}),
    byUrl: url => fetchGetJSON(url)
};

export const Session = {
    get: () => fetchGetJSON(apiPaths.whoami)
};

export const Booking = {
    get: url => fetchGetJSON(url)
};

export const Coupon = {
    validate: coupon => fetchGetJSON(apiPaths.coupon, { coupon })
};

export const Event = {
    get: params => fetchGetJSON(apiPaths.event, params)
};

export const HomePage = {
    promotedList: caption => fetchGetJSON(apiPaths.promoted_list, { caption }),
    byUrl: url => fetchGetJSON(url),
    supportedCities: () => fetchGetJSON(apiPaths.supported_cities)
};

export const Review = {
    createReview: params => fetchPostJSON(apiPaths.review, params),
    updateReview: (url, params) => fetchPutJSON(url, params)
};

export const Host = {
    properties: params => fetchGetJSON(apiPaths.host_properties, params),
    orders: params => fetchGetJSON(apiPaths.order, params),
    bookings: params => fetchGetJSON(apiPaths.booking, params),
    byUrl: url => fetchGetJSON(url),
    post: (url, params) => fetchPostJSON(url, params),
    put: (url, params) => fetchPutJSON(url, params),
    getUsers: email => fetchGetJSON(apiPaths.users, { name: email }),
    createGuest: params => fetchPostJSON(apiPaths.users, params, false),
    createOrderByHost: params => fetchPostJSON(apiPaths.createOrderByHost, params),
    emailOrderHistory: params => fetchPostJSON(`${apiPaths.order}send_order_history_email_to_host/`, params)
};

export const HostOrder = {
    getHostOrder: (ref, code) => fetchGetJSON(apiPaths.ordersByHost, { ref, code }),
    updateOrder: (ref, code, params, id) => fetchPutJSON(`${apiPaths.ordersByHost}${id}/?ref=${ref}&code=${code}`, params, false)
};

export const CancellationPolicy = {
    get: name => fetchGetJSON(apiPaths.cancellationPolicy, { name })
};
