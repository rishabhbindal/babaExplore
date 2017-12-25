import moment from 'moment';

const formatInputDate = str => (str ? moment(str, 'YYYY-MM-DD') : null);

const format = (routeParams) => {
    const params = {};
    Object.keys(routeParams).forEach((key) => {
        if (['city', 'state', 'guest', 'category', 'locality', 'redirectTo', 'forceCategory'].includes(key)) {
            params[key] = routeParams[key];
        } else if (key === 'check_in') {
            params.checkIn = formatInputDate(routeParams[key]);
        } else if (key === 'check_out') {
            params.checkOut = formatInputDate(routeParams[key]);
        } else if (key === 'sort_by') {
            params.sortBy = routeParams[key];
        }
        params.location = [params.city, params.state].filter(Boolean).join(', ');
    });
    params.category = routeParams.forceCategory || params.category;
    params.sortBy = params.sortBy || 'daily_price';
    return params;
};

export default format;
