import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import { getState as appState, actions as appActions } from '../reducers';
import { userPropType } from '../data-shapes/user.js';
import Loader from '../components/Loader/Loader.jsx';
import TruncateTextBetter from '../components/TruncateTextBetter/TruncateTextBetter.jsx';
import UserInfo from '../components/UserInfo/UserInfo.jsx';
import idFromURLEnd from '../lib/idFromURLEnd.js';

const mapStateToProps = (state, { url }) => {
    const user = appState.user.getUser(state, idFromURLEnd(url));
    const isFetching = appState.user.isFetching(state, idFromURLEnd(url));
    return { user, isFetching };
};

class UserInfoContainer extends React.Component {
    static propTypes = {
        fetchUser: PropTypes.func.isRequired,
        isFetching: PropTypes.bool,
        url: PropTypes.string.isRequired,
        user: userPropType
    }

    static defaultProps = {
        isFetching: false,
        user: null
    }

    componentWillMount() {
        this.fetchData();
    }

    fetchData() {
        return this.props.fetchUser(this.props.url);
    }

    render() {
        const { user, isFetching } = this.props;
        if (!user) {
            return isFetching ? <Loader /> : null;
        }

        return (
            <UserInfo
              img={user.profilePic}
              name={user.name}
              quote={<TruncateTextBetter text={user.ownerPropertyIntro} lines={3} />}
            />
        );
    }
}

export default connect(mapStateToProps, {
    fetchUser: appActions.user.fetchUser
})(UserInfoContainer);
