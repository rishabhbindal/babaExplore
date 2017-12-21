import React, { PropTypes } from 'react';
import { withRouter } from 'react-router-dom';

import {
    propTypes as formPropTypes,
    reduxForm
} from 'redux-form';

import DatePicker from 'react-datepicker';
import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';

import CityLocalityOptionsContainer from '../../containers/CityLocalityOptionsContainer.jsx';

import pick from '../../lib/pick.js';
import './SearchForm.scss';

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
    }

    formSubmit(event) {
        event.preventDefault();
        this.props.updateUrl();
    }

    render() {
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
                <form className="search__filter" onSubmit={this.formSubmit}>

                    <div className="SearchForm__top-row city__select">
                        <div className="show-for-medium">
                            {this.isHomePage && <button className="floating__button button" type="submit">Explore</button>}
                            {this.isHomePage && <span className="floating__label">WHERE ARE WE GOING TO</span>}
                            <input type="text" placeholder={this.isSearchPage ? 'Where are we going to?' : null} className={this.isHomePage ? 'search__box city-name' : 'city-name'} value={location} />

                            <div className={`big-city-selector full-size ${displayMode}`}>
                                <ul>{supportedCitiesEle}</ul>
                            </div>
                        </div>
                        {this.isSearchPage &&
                            <CityLocalityOptionsContainer
                              className="show-for-medium"
                              city={searchFilter.city}
                              state={searchFilter.state}
                              locality={searchFilter.locality}
                              onChange={localityChange}
                              withoutLabel
                            />
                        }
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

                <select className="hide-for-medium" value={location || ''} onChange={(e) => {
                    const loc = locationOptions.find(i => i.location === e.target.value);
                    locationChange(loc, forceCategory);
                }}
                >
                    <option value="">Where are we going?</option>
                    {
                        locationOptions.map((city, id) =>
                            (<option value={city.location} key={id}>{ city.location }</option>)
                        )
                    }
                </select>
                    </div>

                    {!(this.isSearchPage && showMap) && !this.isHomePage && <div className="options-select">

                        <fieldset className="check-in-out" data-init="check-in-out">
                            <div className="SearchForm__datepicker__container">
                                <DatePicker
                                  selected={checkIn || null}
                                  dateFormat="DD/MM/YYYY"
                                  placeholderText="Check In"
                                  minDate={moment()}
                                  maxDate={checkOut}
                                  onChange={checkInChange}
                                />
                                <span className="SearchForm__cancel__date" onClick={() => { checkInChange(); }}>X</span>
                            </div>
                            <div className="SearchForm__datepicker__container">
                                <DatePicker
                                  selected={checkOut || null}
                                  dateFormat="DD/MM/YYYY"
                                  placeholderText="Check Out"
                                  disabled={!checkIn}
                                  minDate={checkIn}
                                  onChange={checkOutChange}
                                />
                                <span className="SearchForm__cancel__date" onClick={() => { checkOutChange(); }}>X</span>
                            </div>
                            <div className={hideSubmit ? '' : 'half'}>
                                <select className="guest-select" value={guest || 1} onChange={guestChange}>
                                    {
                                        Array(7).fill().map((_, _id) => {
                                            const value = _id + 1;
                                            return <option key={_id}>{ value === 7 ? '7+' : value }</option>;
                                        })
                                    }
                                </select>
                            </div>
                            <div className={hideSubmit ? 'hide' : 'half'}>
                                <button className="button" type="submit"><i className="icon-search" /></button>
                            </div>
                        </fieldset>
                    </div> }
                </form>
            </div>
        );
    }

}

export default withRouter(reduxForm({
    form: 'home-page-search-form'
})(SearchForm));
