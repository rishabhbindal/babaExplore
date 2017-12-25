import React, { PropTypes } from 'react';
import { withRouter } from 'react-router-dom';

import {
    propTypes as formPropTypes,
    reduxForm
} from 'redux-form';

import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';

import CityLocalityOptionsContainer from '../../containers/CityLocalityOptionsContainer.jsx';
import pick from '../../lib/pick.js';
import './SearchForm.scss';
import { DateRangePicker } from 'react-dates';
import DateRangePickerWrapper from '../../containers/DateRangePickerWrapper.jsx'
class SearchForm extends React.Component {
    static defaultProps = {
        forceCategory: undefined
    }

    static propTypes = {
        ...formPropTypes,
        checkInChange: PropTypes.func.isRequired,
        checkOutChange: PropTypes.func.isRequired,
        guestChange: PropTypes.func.isRequired,
        locationChange: PropTypes.func.isRequired,
        addToFilter: PropTypes.func.isRequired,
        forceCategory: PropTypes.string
    }

    constructor(props) {
        super(props);

        this.formSubmit = this.formSubmit.bind(this);

        this.isHomePage = (this.props.page === 'HOME_PAGE');
        this.isSearchPage = this.props.page === 'SEARCH_RESULTS';
        this.onDatesChange = this.onDatesChange.bind(this);
    }

    formSubmit(event) {
        event.preventDefault();
        this.props.updateUrl();
    }

    onDatesChange(startDate, endDate) {
        console.log(startDate);
    }

    onFocusChange(focusedInput) {
        console.log(focusedInput);
    }

    render() {
        let startDate = moment('2017-dec-11');
        let endDate = moment('2017-dec-30');
        const { locationOptions, searchFilter, hideSubmit, groups } = this.props;
        const { checkIn, checkOut, guest, location, showMap } = searchFilter;
        const { checkInChange, checkOutChange, guestChange, categoryChange, localityChange, locationChange } = this.props;
        const displayMode = (this.isHomePage ? 'upwards' : '');
        const forceCategory = this.props.forceCategory || searchFilter.forceCategory;

        const supportedCitiesEle = (
            locationOptions.map(loc => (
                <li
                  key={`${loc.location}`}
                  className="SearchForm__city-option"
                  onClick={() => { locationChange(loc, forceCategory); }}
                >
                    {loc.city && loc.state && (<span><strong>{loc.city}</strong><small>, {loc.state}</small> </span>)}
                    {loc.city && !loc.state && (<strong>{loc.city}</strong>)}
                    {!loc.city && loc.state && (<strong>{loc.state}</strong>)}
                </li>
            ))
        );

        return (
            <div style={{ width: '100%' }}>
                <div className="search-header show-for-medium">
                    <p>Explore</p>
                    <div className="search-block">
                        <div className="city-search-block search-block-border">
                            <div className="width-100">
                                <p className="font-size-10">WHERE ARE WE GOING TO</p>
                                <input type="text" name="city" className={this.isHomePage ? 'search__box city-name search-input-field' : 'city-name search-input-field'} value={location}/>
                            </div>
                            <img src="file:///Users/rishabhbindal/Downloads/rectangle-2-copy-3.svg"/>
                        </div>
                        <div className="locality-search-block search-block-border">
                            <div className="width-100">
                                <p className="font-size-10">LOCALITY</p>
                                <input className="search-input-field" type="text" name="locality"/>
                            </div>
                            <div className="down-triangle"></div>
                        </div>
                        <div className="search-button">
                            <img src="file:///Users/rishabhbindal/Downloads/rectangle-146.svg"/>
                        </div>
                    </div>
                    <div className="login-button">
                        <a href="">Login / Sign up</a>
                    </div>
                </div>
                <form className="search__filter" onSubmit={this.formSubmit}>
                    <div className="SearchForm__top-row city__select">
                        <div>
                            <DateRangePickerWrapper 
                                initialStartDate={startDate}
                                initialEndDate={endDate}/>
                        </div>
                        {this.isSearchPage && !forceCategory && <div className="show-for-medium">
                            <select
                              value={searchFilter.category}
                              onChange={categoryChange}
                            >
                                <option value="">All Communities</option>
                                {
                                    groups.map(group => (
                                        <option value={group} key={group}>
                                            {group}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>}
                        { this.isSearchPage && showMap && <div>
                            <button className="button" type="submit"><i className="icon-search" /></button>
                        </div> }
                    </div>
                </form>
            </div>
        );
    }

}

export default withRouter(reduxForm({
    form: 'home-page-search-form'
})(SearchForm));
