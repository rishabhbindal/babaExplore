import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import CommunityDetails from '../components/CommunityDetails/CommunityDetails.jsx';
import SearchResultWrapperContainer from './SearchResultWrapperContainer.jsx';
import { actions, getState as appState } from '../reducers';
import { groupPropType } from './../data-shapes/group';
import { parseQuery } from '../lib/queryString.js';
import CommunityPageHelmet from './CommunityPageHelmet.jsx';

const mapStateToProps = (state, { match }) => {
    const communityName = match.params.name;
    const community = appState.community.get(state, communityName);

    return { community, communityName };
};

class CommunityPageContainer extends React.Component {
    static propTypes = {
        communityName: PropTypes.string.isRequired,
        fetchCommunity: PropTypes.func.isRequired,
        routeParams: PropTypes.object,
        community: groupPropType
    };

    componentDidMount() {
        this.fetchData();
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.communityName !== nextProps.communityName) {
            this.fetchData(nextProps.communityName);
        }
    }

    fetchData(communityName) {
        this.props.fetchCommunity(communityName || this.props.communityName);
    }

    render() {
        const { communityName, community, location } = this.props;
        const params = parseQuery(location.search);

        return (
            <div>
                { community && <CommunityPageHelmet community={community} />}
                { community && <CommunityDetails {...community} /> }
                <div className="clearfix" />
                <SearchResultWrapperContainer
                  routeParams={params}
                  forceCategory={communityName}
                  redirectTo={`/community/${communityName}`}
                />
            </div>
        );
    }
}

export default connect(mapStateToProps, {
    fetchCommunity: actions.community.fetchCommunity
})(CommunityPageContainer);
