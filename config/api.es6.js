
const apiBase = path => `${path}/eltApp/api/v0.1`;

const apiPaths = path => ({
    login: `${path}/eltApp/rest-auth/login/`,
    logout: `${path}/eltApp/rest-auth/logout/`,
    facebook: `${path}/eltApp/rest-auth/facebook/`,

    appconfig: `${apiBase(path)}/appconfig/`,
    bookable: `${apiBase(path)}/bookable/`,
    bookableUrl: id => `${apiBase(path)}/bookable/${id}/`,
    booking: `${apiBase(path)}/booking/`,
    cancellationPolicy: `${apiBase(path)}/cancellation_policy/`,
    check_avail_pymts: `${apiBase(path)}/check_avail_pymts/`,
    coupon: `${apiBase(path)}/coupon/`,
    dev_all: `${apiBase(path)}/properties/?dev_all`,
    elt_group_request: `${apiBase(path)}/elt_group_request/`,
    elt_groups: `${apiBase(path)}/elt_groups/`,
    event: `${apiBase(path)}/event/`,
    eventImage: `${apiBase(path)}/event_image/`,
    experience: `${apiBase(path)}/experience/`,
    experience_review: `${apiBase(path)}/experience_review/`,
    experiencebookable: `${apiBase(path)}/experiencebookable/`,
    experiencebooking: `${apiBase(path)}/experiencebooking/`,
    experienceimage: `${apiBase(path)}/experienceimage/`,
    geoimage: `${apiBase(path)}/geoimage/`,
    guests: `${apiBase(path)}/booking/get_users/`,
    love: `${apiBase(path)}/love/`,
    loveUrl: id => `${apiBase(path)}/love/${id}/`,
    loveAvailability: id => `${apiBase(path)}/love/${id}/check_available/`,
    order: `${apiBase(path)}/order/`,
    orderUrl: id => `${apiBase(path)}/order/${id}/`,
    ordersByHost: `${apiBase(path)}/orders_by_host/`,
    createOrderByHost: `${apiBase(path)}/order/create_by_host/`,
    registerPhone: `${apiBase(path)}/phone/`,
    requestVerificationCode: id => `${apiBase(path)}/phone/${id}/verify_phone/`,
    confirmVerificationcode: id => `${apiBase(path)}/phone/${id}/verify_phone_code/`,
    portal_test: `${apiBase(path)}/portal_test/`,
    price: `${apiBase(path)}/price/`,
    promoted_list: `${apiBase(path)}/promoted_list/`,
    properties: `${apiBase(path)}/properties/`,
    propertyUrl: id => `${apiBase(path)}/properties/${id}/`,
    propertyAvailability: id => `${apiBase(path)}/properties/${id}/get_capacity/`,
    propertyimage: `${apiBase(path)}/propertyimage/`,
    property360image: `${apiBase(path)}/property360image/`,
    propertyvideo: `${apiBase(path)}/propertyvideo/`,
    review: `${apiBase(path)}/review/`,
    users: `${apiBase(path)}/users/`,
    whoami: `${apiBase(path)}/whoami/`,
    supported_cities: `${apiBase(path)}/supported_cities/`,
    host_properties: `${apiBase(path)}/properties/owns/`,
    portalCities: `${apiBase(path)}/portal_cities`,
    waitingList: `${apiBase(path)}/waitinglist/`,
    unavailable_booking: `${apiBase(path)}/unavailable_booking/`,
    deactivateUser: id => `${apiBase(path)}/users/${id}/set_status/`
});

// export const devApi = apiPaths('https://dev.explorelifetraveling.com');
// export const prodApi = apiPaths('https://www.explorelifetraveling.com');

// export default env => env === 'production' ? prodApi : devApi;

export default env => apiPaths(env);
export const ApiPaths = apiPaths('');
