import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { actions, getState as appState } from '../reducers';
import { searchPropertyType } from './../data-shapes/property.js';

import SearchResultsMapView from '../components/SearchResultsMapView/SearchResultsMapView.jsx';

const mapStateToProps = (state) => {
    const searchResult = appState.property.getMapViewProperties(state) || {};
    const isLoading = appState.property.isFetchingMapViewProps(state) || false;
    const mapBound = appState.property.isMapBound(state);

    return { searchResult, isLoading, mapBound };
};

const RenderLoading = () => (
    <div className="loading-anim" style={{ clear: 'both', width: '50%' }}>
        <svg
          width="70px"
          height="70px"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid"
          className="uil-ring-alt"
        >
            <rect x="0" y="0" width="100" height="100" fill="none" className="bk" />
            <circle cx="50" cy="50" r="40" stroke="#afafb7" fill="none" strokeWidth="10" strokeLinecap="round" />
            <circle cx="50" cy="50" r="40" stroke="#fe5459" fill="none" strokeWidth="6" strokeLinecap="round">
                <animate
                  attributeName="stroke-dashoffset"
                  dur="3s" repeatCount="indefinite"
                  from="0"
                  to="502"
                />
                <animate
                  attributeName="stroke-dasharray"
                  dur="3s"
                  repeatCount="indefinite"
                  values="150.6 100.4;1 250;150.6 100.4"
                />
            </circle>
        </svg>
    </div>
);

class PropertiesListViewContainer extends React.Component {

    static propTypes = {
        isLoading: PropTypes.bool,
        searchResult: searchPropertyType,
        mapBound: PropTypes.bool,
        setMapBoundVal: PropTypes.func,
        fetchPropertiesByUrl: PropTypes.func,
        resetProperties: PropTypes.func
    }

    constructor(props) {
        super(props);

        this.handlePaginationChange = this.handlePaginationChange.bind(this);
    }

    handlePaginationChange(offset, url) {
        const { isLoading } = this.props;
        if (!isLoading) {
            this.props.resetProperties();
            this.props.fetchPropertiesByUrl(url);
        }
    }

    render() {
        const { searchResult, isLoading, mapBound, setMapBoundVal } = this.props;

        const searchResults = (
            <ul style={{ overflow: 'auto' }}>
                {
                    searchResult &&
                    <SearchResultsMapView
                      searchResult={searchResult}
                      mapBound={mapBound}
                      setMapBoundVal={setMapBoundVal}
                      onPageChange={this.handlePaginationChange}
                      isLoading={isLoading}
                    />
                }
            </ul>
        );

        const statusIndicator = isLoading ? <RenderLoading /> : (
            <div style={{ textAlign: 'center', fontWeight: 'bold' }}>No results found.</div>
        );

        return searchResult ? searchResults : statusIndicator;
    }
}

export default connect(
    mapStateToProps, {
        resetProperties: actions.property.resetProperties,
        fetchPropertiesByUrl: actions.property.fetchPropertiesByUrl,
        setMapBoundVal: actions.property.setMapBoundVal
    }
)(PropertiesListViewContainer);
