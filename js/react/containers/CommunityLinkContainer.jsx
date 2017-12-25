import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import { appState, appActions } from '../reducers';
import { groupPropType } from '../data-shapes/group.js';
import Image from '../components/Image/Image.jsx';
import Loader from '../components/Loader/Loader.jsx';

const mapStateToProps = (state, { name }) => {
    const community = appState.community.get(state, name);
    const isFetching = appState.community.isFetching(state, name);

    return { community, isFetching };
};

class CommunityLinkContainer extends React.Component {
    static propTypes = {
        community: groupPropType,
        fetchCommunity: PropTypes.func.isRequired,
        isFetching: PropTypes.bool,
        name: PropTypes.string.isRequired
    }

    static defaultProps = {
        community: null,
        isFetching: false
    }

    componentWillMount() {
        this.fetchData();
    }

    fetchData() {
        return this.props.fetchCommunity(this.props.name);
    }

    render() {
        const { community, isFetching } = this.props;

        if (!community) {
            return isFetching ? <Loader /> : null;
        }

        const img = (community.images && community.images[0]) || {};
        return (
            <Link className="dib pv2" to={`/community/${community.name}`}>
                {img && (<Image circle width={45} {...img} />)}
                <p className="dib pl2 link">{community.name}</p>
            </Link>
        );
    }
}

export default connect(mapStateToProps, {
    fetchCommunity: appActions.community.fetchCommunity
})(CommunityLinkContainer);
