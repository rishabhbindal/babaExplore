import React, { PropTypes } from 'react';
import { withRouter } from 'react-router-dom';

import {
    propTypes as formPropTypes,
    reduxForm
} from 'redux-form';

import moment from 'moment';

import CityLocalityOptionsContainer from '../../containers/CityLocalityOptionsContainer.jsx';

import pick from '../../lib/pick.js';
import './SearchForm.scss';

class MobileSearchForm extends React.Component {
    static defaultProps = {
        forceCategory: undefined
    }

    static propTypes = {

    }

    constructor(props) {
        super(props);

        this.formSubmit = this.formSubmit.bind(this);
    }

    formSubmit(event) {
        event.preventDefault();
        this.props.updateUrl();
    }

    render() {
        const { locationOptions, searchFilter, hideSubmit, groups } = this.props;
        const { checkIn, checkOut, guest, location, showMap } = searchFilter;
        const { checkInChange, checkOutChange, guestChange, categoryChange, localityChange, locationChange } = this.props;
        const forceCategory = this.props.forceCategory || searchFilter.forceCategory;

        return (
            <form onSubmit={this.formSubmit}>
                <button className="floating__button button" type="submit">Explore</button>
                <span className="floating__label">WHERE ARE WE GOING TO</span>
                <select className="mobile__search" value={location || ''} onChange={(e) => {
                    const loc = locationOptions.find(i => i.location === e.target.value);
                    locationChange(loc, forceCategory);
                }}
                >
                    <option value="">Location?</option>
                    {
                        locationOptions.map((city, id) =>
                            (<option value={city.location} key={id}>{ city.location }</option>)
                        )
                    }
                </select>
            </form>
        );
    }

}

export default withRouter(reduxForm({
    form: 'home-page-search-form'
})(MobileSearchForm));
