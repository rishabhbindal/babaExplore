import React, { PropTypes } from 'react';
import { withRouter } from 'react-router-dom';

import {
    Field,
    propTypes as formPropTypes,
    reduxForm
} from 'redux-form';

import DatePicker from 'react-datepicker';
import moment from 'moment';

import 'react-datepicker/dist/react-datepicker.css';
import './SearchFilterForm.scss';
import SearchFormContainer from '../../containers/SearchFormContainer.jsx';
import CityLocalitiesOptionsContainer from '../../containers/CityLocalityOptionsContainer.jsx';

import { stringifyQuery, parseQuery } from '../../lib/queryString.js';

class SearchFilterForm extends React.Component {
    static propTypes = {
        ...formPropTypes,
        addToFilter: PropTypes.func,
        locationChange: PropTypes.func,
        updateUrl: PropTypes.func.isRequired,
        categoryChange: PropTypes.func.isRequired,
        localityChange: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);

        this.handleCategoryChange = this.handleCategoryChange.bind(this);
        this.handleLocalityChange = this.handleLocalityChange.bind(this);
    }

    handleCategoryChange(event) {
        this.props.addToFilter({ category: event.target.value });
    }

    handleLocalityChange(locality) {
        this.props.addToFilter({ locality });
    }

    render() {
        const { updateUrl, redirectTo, localityChange, categoryChange } = this.props;
        const { searchFilter, page, groups } = this.props;
        const { checkIn, checkOut, guest, location, category, locality } = searchFilter;
        const forceCategory = this.props.forceCategory || searchFilter.forceCategory;

        return (
            <section>
                <div className="row center-column hide-for-medium">
                    <SearchFormContainer
                      page={page}
                      hideSubmit
                      redirectTo={redirectTo}
                    />
                </div>
                <section className="search__housing">
                    <form
                      className="search__filter search__filter__sidebar"
                      onSubmit={(e) => { e.preventDefault(); updateUrl(); }}
                    >
                        <div className="search__filter__panel">
                            <fieldset>
                                <div className="dropdown">
                                    <CityLocalitiesOptionsContainer
                                      city={searchFilter.city}
                                      state={searchFilter.state}
                                      locality={locality}
                                      onChange={localityChange}
                                    />
                                    {
                                        !forceCategory &&
                                        <div>
                                            <label className="special-text">Available to Communities</label>
                                            <select name="sf-groups" value={category || ''} onChange={categoryChange}>
                                                <option value="">All Communities</option>
                                                {
                                                    (groups && groups.length > 0) ? groups.map((group, id) => (
                                                        <option value={group} key={id}>{ group }</option>
                                                    )) : ''
                                                }
                                            </select>
                                            <small>Join more groups to increase listings available to you</small>
                                        </div>
                                    }
                               </div>
                            </fieldset>
                            <input type="submit" className="expanded button" value="Filter results" />
                        </div>
                    </form>
                </section>
            </section>
        );
    }

}

export default withRouter(reduxForm({
    form: 'search-filter-form'
})(SearchFilterForm));
