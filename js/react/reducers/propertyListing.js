import { combineReducers } from 'redux';

import { Property } from './../lib/api.js';
import { genFetchTypes, simpleJSONFetchDispatcher } from '../lib/actionHelpers.js';
import requestStateReducer from '../lib/requestReducerHelper.js';
import { searchPropertyTransform, mapViewPropTransform, eventPropertyTransform } from './../data-shapes/property';
import { imageSetTransform } from './../data-shapes/image';

import removeDupes from '../lib/removeDupes.js';

export const types = {
    createProperty: genFetchTypes('CREATE_PROPERTY'),
    currentProperty: 'SET_CURRENT_PROPERTY',
    property: genFetchTypes('FETCH_PROPERTY'),
    properties: genFetchTypes('SEARCH_PROPERTIES'),
    resetProperties: 'RESET_PROPERTIES',
    addToFilter: 'ADD_TO_FILTER',
    mapBound: 'MAP_BOUND',
    fetchLocalities: genFetchTypes('PORTAL_CITY_FETCH'),
    mapViewProps: genFetchTypes('SEARCH_PROPERTIES_MAP_VIEW'),
    resetMapViewProperties: 'RESET_MAPVIEW_PROPERTIES',
    addPropertyImage: genFetchTypes('ADD_PROPERTY_IMAGE'),
    updatePropertyImage: genFetchTypes('UPDATE_PROPERTY_IMAGE'),
    deletePropertyImage: genFetchTypes('DELETE_PROPERTY_IMAGE'),
    addPropertyVideo: genFetchTypes('ADD_PROPERTY_VIDEO'),
    updatePropertyDetails: genFetchTypes('UPDATE_PROPERTY_DETAILS'),
    updateBookableDetails: genFetchTypes('UPDATE_BOOKABLE_DETAILS'),
    fetchUnvailableDates: genFetchTypes('FETCH_UNAVAILABLE_DATE'),
    updateUnvailableDates: genFetchTypes('UPDATE_UNAVAILABLE_DATE'),
    deleteUnavailableDates: genFetchTypes('DELETE_UNAVAILABLE_DATE'),
    fetchSpecialPrices: genFetchTypes('FETCH_SPECIAL_PRICES'),
    updateSpecialPrice: genFetchTypes('UPDATE_SPECIAL_PRICES'),
    deleteSpecialPrice: genFetchTypes('DELETE_SPECIAL_PRICES'),
    fetchBookings: genFetchTypes('FETCH_BOOKED_DATES')
};

// Current property code
const currentPropertyReducer = (state = null, { type, payload }) => {
    switch (type) {
    case types.currentProperty:
        return payload;
    default:
        return state;
    }
};

const propertiesReducer = (state = { properties: [], count: 0, next: null, previous: null }, { type, payload }) => {
    switch (type) {
    case types.properties.SUCCESS:
        return { ...state, ...payload };
    case types.properties.FAILURE:
        return { ...state, properties: [], count: 0, next: null, previous: null };
    case types.resetProperties:
        return { ...state, properties: [], count: 0, next: null, previous: null };
    default:
        return state;
    }
};

const mapViewPropsReducer = (
    state = { properties: [], count: 0, next: null, previous: null },
    { type, payload }) => {
    switch (type) {
    case types.mapViewProps.SUCCESS:
        return { ...state, ...payload };
    case types.resetMapViewProperties:
    case types.mapViewProps.FAILURE:
        return { ...state, properties: [], count: 0, next: null, previous: null };
    default:
        return state;
    }
};


const propertyReducer = (state = {}, { type, payload }) => {
    switch (type) {
    case types.property.SUCCESS: {
        if (!payload || !payload.code) {
            return state;
        }

        return { ...state, ...{ [payload.code]: payload } };
    }
    case types.property.FAILURE:
    default:
        return state;
    }
};

const searchFilterReducers = (state = {}, { type, payload }) => {
    switch (type) {
    case types.addToFilter:
        return { ...state, ...payload };
    default:
        return state;
    }
};

const mapBoundReducer = (state = false, { type, payload }) => {
    switch (type) {
    case types.mapBound:
        return payload;
    default:
        return state;
    }
};

const getPropertyImageFormData = (data) => {
    const formData = new FormData();

    if (data.image != null) {
        formData.append('image', data.image);
    }
    if (data.caption != null) {
        formData.append('caption', data.caption);
    }
    if (data.ordering != null) {
        formData.append('ordering', data.ordering);
    }
    if (data.property != null) {
        formData.append('property', data.property);
    }
    if (data.bookable_item != null) {
        formData.append('bookable_item', data.bookable_item);
    }

    return formData;
};

const getPriceFormJson = (data) => {
    return {
        bookable_item: data.bookableItem,
        date_from: data.startDate,
        date_until: data.endDate,
        price_delta: data.priceDelta
    };
};

const getUnavailableDatesFormJson = (data) => {
    return {
        bookable_item: data.bookableItem,
        date_from: data.startDate,
        date_until: data.endDate,
        owner: data.owner
    };
};

const getBookedFormJson = (data) => {
    return {
        bookable_item: data.bookableItem,
        date_from: data.startDate,
        date_until: data.endDate
    };
};

const actions = {
    createProperty: data => simpleJSONFetchDispatcher({
        promiseFn: () => Property.createProperty(data),
        actionTypes: types.createProperty,
        returnResponse: true,
        transform: res => eventPropertyTransform(res)
    }),
    setCurrentProperty: propertyCode => ({
        type: types.currentProperty,
        payload: propertyCode
    }),
    resetCurrentProperty: () => ({
        type: types.currentProperty,
        payload: null
    }),
    fetchProperties: (params, mapView) => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Property.get({ ...(params || {}), ...(mapView ? { summary: true } : {}) }),
            actionTypes: mapView ? types.mapViewProps : types.properties,
            transform: ({ count, next, results, previous, url }) => ({
                url,
                count,
                next,
                previous,
                properties: results.map(result => mapView ? mapViewPropTransform(result) : searchPropertyTransform(result))
            })
        })
    ),
    fetchProperty: code => simpleJSONFetchDispatcher({
        id: code,
        promiseFn: () => Property.get({ code }),
        actionTypes: types.property,
        transform: res => res.results[0] && eventPropertyTransform(res.results[0])
    }),
    fetchPropertiesByUrl: url => dispatch => dispatch(
        simpleJSONFetchDispatcher({
            promiseFn: () => Property.byUrl(url),
            actionTypes: types.properties,
            transform: ({ count, next, results, previous, url }) => ({
                url,
                count,
                next,
                previous,
                properties: results.map(result => searchPropertyTransform(result))
            })
        })
    ),
    resetProperties: () => ({
        type: types.resetProperties
    }),
    addToFilter: params => ({
        type: types.addToFilter,
        payload: params
    }),
    setMapBoundVal: val => ({
        type: types.mapBound,
        payload: val
    }),
    fetchLocalities: ({ city, state, country = 'India' }) => simpleJSONFetchDispatcher({
        promiseFn: () => Property.fetchLocalities({ city, state, country }),
        returnResponse: true,
        transform: res => (res.results[0] &&
            res.results[0].additional_info && res.results[0].additional_info.neighbourhoods) || [],
        actionTypes: types.fetchLocalities
    }),
    resetMapViewProperties: () => ({
        type: types.resetMapViewProperties
    }),
    addPropertyImage: (data, propertyId, imageType) => {
        const formData = getPropertyImageFormData(data);
        return simpleJSONFetchDispatcher({
            promiseFn: () => Property.addPropertyImage(formData, propertyId, imageType),
            actionTypes: types.addPropertyImage,
            returnResponse: true,
            transform: res => imageSetTransform(res)
        });
    },
    updatePropertyImage: (data, imageId, imageType) => {
        const formData = getPropertyImageFormData(data);
        return simpleJSONFetchDispatcher({
            promiseFn: () => Property.updatePropertyImage(formData, imageId, imageType),
            actionTypes: types.updatePropertyImage,
            returnResponse: true,
            transform: res => imageSetTransform(res)
        });
    },
    deletePropertyImage: (imageId, imageType) => {
        return simpleJSONFetchDispatcher({
            promiseFn: () => Property.deletePropertyImage(imageId, imageType),
            actionTypes: types.deletePropertyImage
        });
    },
    addPropertyPanoramaImage: data => {
        const formData = getPropertyImageFormData(data);
        return simpleJSONFetchDispatcher({
            promiseFn: () => Property.addPropertyPanoramaImage(formData),
            actionTypes: types.addPropertyImage,
            returnResponse: true,
            transform: res => res
        });
    },
    addPropertyVideo: data => {
        return simpleJSONFetchDispatcher({
            promiseFn: () => Property.addPropertyVideo(data),
            actionTypes: types.addPropertyVideo,
            returnResponse: true,
            transform: res => res
        });
    },
    updatePropertyDetails: (data, property) => {
        return simpleJSONFetchDispatcher({
            promiseFn: () => Property.updatePropertyDetails(data, property.id),
            actionTypes: types.updatePropertyDetails,
            returnResponse: true,
            transform: res => eventPropertyTransform(res)
        });
    },
    updateBookableDetails: (bookable) => {
        return simpleJSONFetchDispatcher({
            promiseFn: () => Property.updateBookableDetails(bookable),
            actionTypes: types.updateBookableDetails,
            returnResponse: true,
            transform: res => res
        });
    },
    fetchUnvailableDates: (data) => simpleJSONFetchDispatcher({
        promiseFn: () => Property.fetchUnvailableDates(getUnavailableDatesFormJson(data)),
        returnResponse: true,
        actionTypes: types.fetchUnvailableDates
    }),
    updateUnvailableDates: (data) => simpleJSONFetchDispatcher({
        promiseFn: () => Property.updateUnvailableDates(getUnavailableDatesFormJson(data)),
        returnResponse: true,
        actionTypes: types.updateUnvailableDates
    }),
    deleteUnavailableDates: unavailableId => simpleJSONFetchDispatcher({
        promiseFn: () => Property.deleteUnavailableDates(unavailableId),
        returnResponse: true,
        actionTypes: types.deleteUnavailableDates
    }),

    fetchSpecialPrices: data => simpleJSONFetchDispatcher({
        promiseFn: () => Property.fetchSpecialPrices(getPriceFormJson(data)),
        returnResponse: true,
        actionTypes: types.fetchSpecialPrices
    }),
    updateSpecialPrice: data => simpleJSONFetchDispatcher({
        promiseFn: () => Property.updateSpecialPrice(getPriceFormJson(data)),
        returnResponse: true,
        actionTypes: types.updateSpecialPrice
    }),
    deleteSpecialPrice: spId => simpleJSONFetchDispatcher({
        promiseFn: () => Property.deleteSpecialPrice(spId),
        returnResponse: true,
        actionTypes: types.deleteSpecialPrice
    }),
    modifySpecialPrice: (id, data) => simpleJSONFetchDispatcher({
        promiseFn: () => Property.modifySpecialPrice(id, getPriceFormJson(data)),
        returnResponse: true,
        actionTypes: types.updateSpecialPrice
    }),

    fetchBookings: data => simpleJSONFetchDispatcher({
        promiseFn: () => Property.fetchBookings(getBookedFormJson(data)),
        returnResponse: true,
        actionTypes: types.fetchBookings
    })
};

const getFns = {
    getCurrentPropertyCode: state => state.currentProperty,
    getCurrentProperty: state => state.currentProperty && state.property[state.currentProperty],
    getProperty: (state, code) => state.property[code],
    isFetchingProperty: (state, code) => state.fetchPropertyState[code] && state.fetchPropertyState[code].isFetching,
    getProperties: state => state.properties,
    getSearchFilters: state => state.searchFilter,
    isFetching: state => state.fetchPropertiesState.isFetching,
    isMapBound: state => state.mapBound,
    getMapViewProperties: state => state.mapViewProps,
    isFetchingMapViewProps: state => state.isFetchingMapViewProps.isFetching
};

export default {
    actions,
    get: getFns,
    reducer: combineReducers({
        currentProperty: currentPropertyReducer,
        property: propertyReducer,
        fetchPropertyState: requestStateReducer(types.property),
        properties: propertiesReducer,
        searchFilter: searchFilterReducers,
        fetchPropertiesState: requestStateReducer(types.properties),
        mapBound: mapBoundReducer,
        mapViewProps: mapViewPropsReducer,
        isFetchingMapViewProps: requestStateReducer(types.mapViewProps)
    })
};
