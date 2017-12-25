import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import { withRouter } from 'react-router-dom';
import moment from 'moment';

import { actions as appActions, getState as appState } from '../reducers';
import { parseQuery, stringifyQuery } from '../lib/queryString.js';
import formatRouteParams from '../lib/formatRouteParams.js';

import SearchFormContainer from './SearchFormContainer.jsx';
import SearchHeaderContainer from './SearchHeaderContainer.jsx';
import PropertiesListViewContainer from './PropertiesListViewContainer.jsx';
import SearchResultsMapViewContainer from './SearchResultsMapViewContainer.jsx';
import pick from '../lib/pick.js';

const searchParamKeys = [
    'city', 'state', 'guest', 'accommodation_type',
    'category', 'locality', 'forceCategory'
];

const searchQuery = searchFilter => stringifyQuery(pick(
    searchFilter,
    ['city', 'state'],
    { omitFalse: true }
));

const mapStateToProps = (state) => {
    const searchResult = appState.property.getProperties(state) || {};
    const searchFilter = appState.property.getSearchFilters(state);
    const mapViewProperties = appState.property.getMapViewProperties(state);
    return { searchResult, searchFilter, mapViewProperties };
};

class SearchResultWrapperContainer extends React.Component {
    static propTypes = {
        searchFilter: PropTypes.object,
        searchResult: PropTypes.object,
        fetchProperties: PropTypes.func.isRequired,
        forceCategory: PropTypes.string,
        redirectTo: PropTypes.string
    }

    constructor(props) {
        super(props);
        this.showSearchPage = this.showSearchPage.bind(this);
        this.onNewSearch = this.onNewSearch.bind(this);
    }

    componentDidMount() {
        this.fetchData();
    }

    componentWillReceiveProps(nextProps) {
        if (
            this.props.forceCategory !== nextProps.forceCategory
            || this.props.location.search !== nextProps.location.search
            || this.props.searchFilter.showMap !== nextProps.searchFilter.showMap
        ) {
            // fetchData for map only once
            console.log('fetch again, because location changed');
            this.fetchData(nextProps);
        }
    }

    onNewSearch(searchParams) {
        const { resetProperties, fetchProperties, setMapBoundVal, resetMapViewProperties } = this.props;
        const { location, redirectTo, history } = this.props;

        const limit = searchParams.limit || (searchParams.showMap ? 1000 : null);
        const params = { ...parseQuery(location.search || ''), limit };

        const resetFn = limit ? resetMapViewProperties : resetProperties;
        const fetchFn = limit ? query => fetchProperties(query, 'mapview') : query => fetchProperties(query);

        resetFn();
        fetchFn(searchParams)
            .then(() => setMapBoundVal(false));

        const url = redirectTo || params.redirectTo || '/search';
        history.push({
            pathname: url,
            search: stringifyQuery(searchParams)
        });
    }

    fetchData(props) {
        const { fetchProperties, resetMapViewProperties, resetProperties } = this.props;
        const params = this.handleParams(props || this.props);

        if (params.sort_by) {
            params.sortBy = params.sort_by;
        }

        const fetchFn = params.limit ? query => fetchProperties(query, 'mapview') : query => fetchProperties(query);

        fetchFn(params);
    }

    handleParams(props) {
        const { location, forceCategory, type, tags, limit, searchFilter } = props;
        const params = parseQuery(location.search);

        const searchParams = { country: 'India' };

        const sanitizeParameter = (key, val) => {
            if (val && searchParamKeys.includes(key)) { searchParams[key] = val; }
        };

        Object.keys(params).filter(Boolean).map(key => sanitizeParameter(key, params[key]));

        searchParams.category = forceCategory || params.category || '';
        searchParams.sort_by = params.sortBy || params.sort_by || 'daily_price';

        if (params.checkIn) {
            searchParams.check_in = params.checkIn.format('YYYY-MM-DD');
        }
        if (params.checkOut) {
            searchParams.check_out = params.checkOut.format('YYYY-MM-DD');
        }
        if (type) {
            searchParams.type = type;
        }
        if (tags) {
            searchParams.tags = tags;
        }

        if (searchFilter.showMap) {
            searchParams.limit = 1000;
        }

        if (limit) {
            searchParams.limit = limit;
        }

        return searchParams;
    }

    showSearchPage() {
        const { history, searchFilter } = this.props;
        const { redirectTo } = searchFilter;
        const params = pick(
            searchFilter,
            ['city', 'state', 'country', 'category', 'accommodation_type', 'locality', 'guest'],
            { omitFalse: true }
        );
        params.check_in = searchFilter.checkIn && moment(searchFilter.checkIn).format('YYYY-MM-DD');
        params.check_out = searchFilter.checkOut && moment(searchFilter.checkOut).format('YYYY-MM-DD');
        history.push({
            pathname: '/search-filter',
            search: stringifyQuery({
                forceCategory: this.props.forceCategory,
                redirectTo,
                ...params
            })
        });
    }

    render() {
        const { searchResult, searchFilter, location, forceCategory, mapViewProperties } = this.props;
        const params = parseQuery(location.search || '');
        const redirectTo = this.props.redirectTo || params.redirectTo;

        const mobileFilter = (
            <div className="hide-for-medium">
                <form className="search__filter">
                    <div className="city__select">
                        <input
                          type="text"
                          placeholder="Where are we going?"
                          onFocus={this.showSearchPage}
                        />
                    </div>
                </form>
            </div>
        );

        const showMorePropLink = /\/community\//.test(redirectTo || '');

        return (
            <div>
                { !searchFilter.showMap && <div>
                    <section>
                        <div className="row center-column">
                            <div className="show-for-medium">
                                <SearchFormContainer
                                  onSubmit={this.onNewSearch}
                                  page={'SEARCH_RESULTS'}
                                  forceCategory={forceCategory || params.forceCategory}
                                  redirectTo={redirectTo}
                                />
                            </div>
                            { mobileFilter }
                        </div>
                    </section>
                    <section>
                        <div className="row bigger">
                            <div
                              className="main__body main__body__large"
                              style={{ float: 'none', margin: 'auto' }}
                            >
                                <section className="search-results">
                                    <div className="row flush">
                                        <SearchHeaderContainer params={searchFilter} />
                                        <PropertiesListViewContainer />
                                    </div>
                                </section>
                                
                            </div>
                        </div>
                    </section> </div> }
                {searchFilter.showMap && <div>
                    <div>
                        <div style={{ padding: '.5rem' }}>
                            { mobileFilter }
                        </div>
                        <SearchHeaderContainer
                          onSubmit={this.onNewSearch}
                          params={searchFilter}
                          redirectTo={redirectTo}
                          forceCategory={forceCategory}
                        />
                    </div>
                    <SearchResultsMapViewContainer searchResult={mapViewProperties} />
                    </div> 
                }
            </div>
        );
    }
}

export default withRouter(connect(mapStateToProps, {
    fetchProperties: appActions.property.fetchProperties,
    resetProperties: appActions.property.resetProperties,
    setMapBoundVal: appActions.property.setMapBoundVal,
    addToFilter: appActions.property.addToFilter,
    resetMapViewProperties: appActions.property.resetMapViewProperties
})(SearchResultWrapperContainer));
