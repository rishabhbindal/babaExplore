import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { actions, getState as appState } from '../reducers';
import SearchPropertyContainer from './SearchPropertyContainer.jsx';
import { searchPropertyType } from './../data-shapes/property.js';
import Pagination from './../components/Pagination/Pagination.jsx';

const mapStateToProps = (state) => {
    const searchResult = appState.property.getProperties(state) || {};
    const isLoading = appState.property.isFetching(state) || false;

    return { searchResult, isLoading };
};

const RenderLoading = () => (
    <div className="loading-anim">
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
        fetchPropertiesByUrl: PropTypes.func.isRequired,
        resetProperties: PropTypes.func.isRequired
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
        const { searchResult, isLoading } = this.props;
        const { count, previous, next, properties } = searchResult;
        return (
            <div>
                { isLoading && <RenderLoading /> }
                {
                    properties && properties.length ? (
                        <ul className="property__list">
                            {
                                properties.map(property => (
                                    <SearchPropertyContainer
                                      property={property}
                                      ownerUrl={property.owner}
                                      key={property.url}
                                    />
                                ))
                            }
                        </ul>
                    ) : (
                        !isLoading &&
                        <div style={{ textAlign: 'center', margin: '2rem 0', fontWeight: 'bold' }}>
                            No results found.
                        </div>
                    )
                }
                <Pagination
                  count={count}
                  previousUrl={previous}
                  nextUrl={next}
                  onChange={this.handlePaginationChange}
                />
            </div>
        );
    }
}

export default connect(
    mapStateToProps, {
        fetchPropertiesByUrl: actions.property.fetchPropertiesByUrl,
        resetProperties: actions.property.resetProperties
    }
)(PropertiesListViewContainer);
