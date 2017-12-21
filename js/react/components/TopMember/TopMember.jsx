import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { actions, getState as appState } from '../../reducers';
import { userPropType } from '../../data-shapes/user.js';
import UserQuote from '../UserQuote/UserQuote.jsx';
import TruncatedText from '../TruncatedText/TruncatedText.jsx';
import Guest from '../Guest/Guest.jsx';

const mapStateToProps = (state, { memberUrl }) => {
    const member = appState.user.getUserByURL(state, memberUrl);
    return { member };
};

class TopMember extends React.Component {
    static propTypes = {
        fetchMember: PropTypes.func.isRequired,
        memberUrl: PropTypes.string.isRequired,
        member: userPropType
    }

    componentWillMount() {
        const { memberUrl } = this.props;
        if (memberUrl) {
            this.fetch(memberUrl);
        }
    }

    fetch(memberUrl) {
        this.props.fetchMember(memberUrl);
    }

    render() {
        const { member } = this.props;
        if (member) {
            return <Guest guest={member} key={member.url} />;
        }
        return null;
    }
}

export default connect(
    mapStateToProps, {
        fetchMember: actions.user.fetchUser
    }
)(TopMember);
