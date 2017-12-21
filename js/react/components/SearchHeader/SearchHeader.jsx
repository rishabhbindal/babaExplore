import React, { PropTypes } from 'react';
import {
    propTypes as formPropTypes,
    reduxForm
} from 'redux-form';
import { withRouter } from 'react-router-dom';

import 'react-datepicker/dist/react-datepicker.css';
import Button from '../Button/Button.jsx';
import './SearchHeader.scss';
import BookingDateRange from '../BookingDateRange/BookingDateRange.jsx';
import SearchFormContainer from '../../containers/SearchFormContainer.jsx';

import { stringifyQuery } from '../../lib/queryString.js';

const SortByAttributes = {
    '₹₹₹ → ₹': '-daily_price',
    '₹ → ₹₹₹': 'daily_price'
};

class SearchHeader extends React.Component {
    static propTypes = {
        ...formPropTypes
    }

    constructor(props) {
        super(props);

        this.sortByChange = this.sortByChange.bind(this);
        this.hideMap = this.hideMap.bind(this);
        this.showMap = this.showMap.bind(this);

        const { location } = this.props;
        this.isHomePage = location && location.pathname === '/';
    }

    componentWillMount() {
        const params = this.props.params || {};
        params.sortBy = params.sortBy || 'daily_price';
        this.props.addToFilter({ sortBy: params.sortBy });
    }

    sortByChange(event) {
        this.props.addToFilter({ sortBy: event.target.value });

        const toHttpParameters = ({ city, state, checkIn, checkOut, guest, sortBy, category, accommodation_type }) => {
            const params = {};
            if (city) {
                params.city = city;
            }
            if (state) {
                params.state = state;
            }
            if (checkIn) {
                params.check_in = checkIn.format('YYYY-MM-DD');
            }
            if (checkOut) {
                params.check_out = checkOut.format('YYYY-MM-DD');
            }
            if (guest) {
                params.guest = guest;
            }

            if (sortBy) {
                params.sort_by = sortBy;
            }

            if (category) {
                params.category = category;
            }

            if (!city && !state) {
                params.country = 'india';
            }

            if (this.props.page === 'DAY_LOUNGE') {
                params.type = 'DAY_LOUNGE';
            } else if (this.props.page === 'ExperientialStays') {
                params.tags = 'ExperientialStays';
            } else {
                params.type = 'ACCOMMODATION';
            }

            if (accommodation_type && accommodation_type.length > 0) {
                params.accommodation_type = accommodation_type;
            }

            return params;
        };

        const searchParams = toHttpParameters({ ...this.props.searchFilter, sortBy: event.target.value });

        this.props.resetProperties();
        this.props.fetchProperties(searchParams)
            .then(() => Promise.all([
            ]));

        const { location } = this.props;
        const url = this.isHomePage ? '/search' : location.pathname;
        this.props.history.push({
            pathname: url,
            search: stringifyQuery(searchParams)
        });
    }

    renderOptions = options => (
        Object.keys(options).map((key, id) => (
            <option value={options[key]} key={id}>{ key }</option>)
        )
    )

    hideMap() {
        this.props.addToFilter({ showMap: false });
    }

    showMap() {
        this.props.addToFilter({ showMap: true });
    }

    render() {
        const { searchFilter } = this.props;
        const { sortBy, city, state, guest, checkIn, checkOut, showMap } = searchFilter;
        const { redirectTo, forceCategory, onSubmit } = this.props;
        const mapViewBtnClass = showMap ? 'SearchHeader__button' : 'SearchHeader__button__hollow';
        const listViewBtnClass = showMap ? 'SearchHeader__button__hollow' : 'SearchHeader__button';

        const viewTypeSelector = (
            <div className="SearchHeader__viewbutton__container">
                <button className={listViewBtnClass} onClick={this.hideMap}>
                    List View
                </button>
                <button className={mapViewBtnClass} onClick={this.showMap}>
                    Map View
                </button>
            </div>
        );

        const location = (city && city.length > 0) ? city : (state && state.length)
            ? state : 'India';
        const searchSummary = (
            <div className="divider-left hide-for-medium search-summary">
                <h4>{ location }</h4>
                <BookingDateRange
                  checkIn={checkIn && checkIn.toISOString()}
                  checkOut={checkOut && checkOut.toISOString()}
                />
                { (guest && (<small>#{guest} guests</small>)) }
            </div>
        );

        const ListViewHeader = (
            <div>
                {searchSummary}

                <div className="divider-right">
                    {viewTypeSelector}
                    <select onChange={this.sortByChange} value={sortBy} className="SearchHeader__select">
                        { this.renderOptions(SortByAttributes)}
                    </select>
                </div>
            </div>
        );

        const MapViewHeader = (
            <div style={{ display: 'flex', 'flexDirection': 'row' }}>
                <div className="MapViewHeader__type_selector">
                    {viewTypeSelector}
                    {searchSummary}
                </div>
                <div className="show-for-medium MapViewHeader__searchform">
                    <SearchFormContainer
                      onSubmit={onSubmit}
                      page={'SEARCH_RESULTS'}
                      forceCategory={forceCategory || searchFilter.forceCategory}
                      redirectTo={redirectTo}
                    />
                </div>
            </div>
        );

        const content = showMap ? MapViewHeader : ListViewHeader;

        return (
            <div className="search__header">
                {content}
            </div>
        );
    }

}

export default withRouter(reduxForm({
    form: 'home-page-search-header'
})(SearchHeader));
