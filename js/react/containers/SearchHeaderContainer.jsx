import { connect } from 'react-redux';

import { actions as appActions, getState as appState } from '../reducers';
import SearchHeader from '../components/SearchHeader/SearchHeader.jsx';

const mapStateToProps = (state) => {
    const searchFilter = appState.property.getSearchFilters(state) || {};
    return { searchFilter };
};

export default connect(mapStateToProps, {
    addToFilter: appActions.property.addToFilter,
    fetchProperties: appActions.property.fetchProperties,
    resetProperties: appActions.property.resetProperties
})(SearchHeader);
