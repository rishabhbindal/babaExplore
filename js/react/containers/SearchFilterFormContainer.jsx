import React from 'react';
import { connect } from 'react-redux';

import { actions as appActions, getState as appState } from '../reducers';
import SearchFormWrapperContainer from './SearchFormWrapperContainer.jsx';
import SearchFilterForm from '../components/SearchFilterForm/SearchFilterForm.jsx';

const mapStateToProps = (state, { routeParams }) => {
    const searchFilter = appState.property.getSearchFilters(state) || {};
    const supportedCities = appState.homePage.getSupportedCities(state) || [];
    const groups = appState.appConfig.groupNames(state) || [];
    return { searchFilter, supportedCities, groups, routeParams };
};

const SearchFilterFormContainer = props => (
    <SearchFormWrapperContainer>
        <SearchFilterForm {...props} />
    </SearchFormWrapperContainer>
);

export default connect(mapStateToProps, {
    addToFilter: appActions.property.addToFilter,
    fetchProperties: appActions.property.fetchProperties,
    resetProperties: appActions.property.resetProperties,
    fetchGroups: appActions.appConfig.fetchGroups
})(SearchFilterFormContainer);
