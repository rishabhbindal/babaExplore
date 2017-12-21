import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import moment from 'moment';

import { actions as appActions, getState as appState } from '../reducers';
import { searchFilterPropTypes, searchFilterDefaultProps } from '../data-shapes/property.js';

import { parseQuery, stringifyQuery } from '../lib/queryString.js';
import formatRouteParams from '../lib/formatRouteParams.js';
import pick from '../lib/pick.js';

const mapStateToProps = (state) => {
    const searchFilter = appState.property.getSearchFilters(state);
    const supportedCities = appState.homePage.getSupportedCities(state) || [];
    return { searchFilter, supportedCities };
};

class SearchFormWrapper extends React.Component {
    static defaultProps = {
        searchFilter: searchFilterDefaultProps
    }

    static propTypes = {
        searchFilter: searchFilterPropTypes,
        addToFilter: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.getParamsFromUrl = this.getParamsFromUrl.bind(this);
        this.updateUrl = this.updateUrl.bind(this);
        this.checkInChange = this.checkInChange.bind(this);
        this.checkOutChange = this.checkOutChange.bind(this);
        this.guestChange = this.guestChange.bind(this);
        this.categoryChange = this.categoryChange.bind(this);
        this.localityChange = this.localityChange.bind(this);
        this.locationChange = this.locationChange.bind(this);
    }

    componentDidMount() {
        this.getParamsFromUrl();
    }

    getParamsFromUrl() {
        const { location, addToFilter } = this.props;

        const routeParams = parseQuery(location.search);
        const params = formatRouteParams(routeParams);

        addToFilter(params);
    }

    updateUrl() {
        const { history } = this.props;
        const { searchFilter } = this.props;
        const { sortBy, checkIn, checkOut, redirectTo } = searchFilter;

        const params = pick(
            searchFilter,
            ['city', 'state', 'guest', 'category', 'locality'],
            { omitFalse: true }
        );
        params.check_in = checkIn && moment(checkIn).format('YYYY-MM-DD');
        params.check_out = checkOut && moment(checkOut).format('YYYY-MM-DD');
        params.sort_by = sortBy || 'daily_price';

        history.push({
            pathname: redirectTo || '/search',
            search: stringifyQuery(params)
        });
    }

    checkInChange(date) {
        this.props.addToFilter({ checkIn: date });
    }

    checkOutChange(date) {
        this.props.addToFilter({ checkOut: date });
    }

    guestChange(e) {
        e.stopPropogation();
        this.props.addToFilter({ guest: e.target.value });
    }

    categoryChange(e) {
        this.props.addToFilter({ category: e.target.value });
    }

    localityChange(locality) {
        this.props.addToFilter({ locality });
    }

    locationChange(data = {}, forceCategory) {
        this.props.addToFilter({
            location: data.location,
            city: data.city,
            state: data.state,
            locality: '',
            category: forceCategory || ''
        });
    }

    render() {
        const { updateUrl, checkInChange, checkOutChange, guestChange, categoryChange, localityChange, locationChange } = this;
        return (
            <div style={{ width: '100%' }}>
                { React.Children.map(this.props.children, elem => React.cloneElement(elem, {
                    updateUrl,
                    checkInChange,
                    checkOutChange,
                    guestChange,
                    categoryChange,
                    localityChange,
                    locationChange
                })) }
            </div>
        );
    }
}

export default withRouter(connect(mapStateToProps, {
    addToFilter: appActions.property.addToFilter,
    fetchGroups: appActions.appConfig.fetchGroups
})(SearchFormWrapper));
