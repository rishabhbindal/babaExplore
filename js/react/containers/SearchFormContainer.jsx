import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { actions as appActions, getState as appState } from '../reducers';
import SearchFormWrapperContainer from './SearchFormWrapperContainer.jsx';
import SearchForm from '../components/SearchForm/SearchForm.jsx';
import MobileSearchForm from '../components/SearchForm/MobileSearchForm.jsx';

const mapStateToProps = (state) => {
    const searchFilter = appState.property.getSearchFilters(state) || {};
    const groups = appState.appConfig.groupNames(state) || [];
    const supportedCities = appState.homePage.getSupportedCities(state);
    const locationOptions = (supportedCities && supportedCities.cityItems) || [];
    return { searchFilter, groups, locationOptions };
};

class SearchFormContainer extends React.Component {
    static propTypes = {
        groups: PropTypes.arrayOf(PropTypes.any),
        searchFilter: PropTypes.shape({
            city: PropTypes.string,
            state: PropTypes.string,
            locality: PropTypes.string,
            category: PropTypes.string,
            guests: PropTypes.number
        }),
        redirectTo: PropTypes.string,
        fetchSupportedCities: PropTypes.func.isRequired,
        setMapBoundVal: PropTypes.func.isRequired,
        addToFilter: PropTypes.func.isRequired
    }

    static defaultProps = {
        groups: [],
        searchFilter: {},
        redirectTo: ''
    }

    componentDidMount() {
        this.props.fetchSupportedCities();

        const { redirectTo, addToFilter } = this.props;
        addToFilter({ redirectTo });
    }

    render() {
        const { groups, redirectTo, mobileFriendly } = this.props;
        if(mobileFriendly)
        {
            return (<SearchFormWrapperContainer redirectTo={redirectTo}><MobileSearchForm {...this.props} groups={groups} /></SearchFormWrapperContainer>);
        }
        return (
            <SearchFormWrapperContainer redirectTo={redirectTo}>
                <SearchForm {...this.props} groups={groups} />
            </SearchFormWrapperContainer>
        );
    }
}

export default connect(mapStateToProps, {
    addToFilter: appActions.property.addToFilter,
    fetchProperties: appActions.property.fetchProperties,
    resetProperties: appActions.property.resetProperties,
    fetchGroups: appActions.appConfig.fetchGroups,
    setMapBoundVal: appActions.property.setMapBoundVal,
    fetchSupportedCities: appActions.homePage.fetchSupportedCities
})(SearchFormContainer);
