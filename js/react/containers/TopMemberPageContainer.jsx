import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import TopMembers from '../components/TopMembers/TopMembers.jsx';

import { actions, getState as appState } from '../reducers';


const mapStateToProps = (state, { match, isMangersList }) => {
    const communityName = match.params.name;
    const group = appState.community.get(state, communityName) || {};
    const name = group.name || communityName;

    const prefix = isMangersList ? 'Admins of' : 'Top members of';
    const title = `${prefix} ${name}`;

    return { users: isMangersList ? group.groupAdmins : group.members, title };
};

class TopMemberPageContainer extends React.Component {
    static propTypes = {
        fetchGroup: PropTypes.func.isRequired
    };

    componentDidMount() {
        const { match: { params: { name } } } = this.props;
        this.props.fetchGroup(name);
    }

    render() {
        const { title, users } = this.props;

        return <TopMembers members={users} title={title} />;
    }
}

export default connect(mapStateToProps, {
    fetchGroup: actions.community.fetchCommunity
})(TopMemberPageContainer);
