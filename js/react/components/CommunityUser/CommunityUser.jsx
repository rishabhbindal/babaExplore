import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { actions, getState as appState } from '../../reducers';
import TruncatedText from '../TruncatedText/TruncatedText.jsx';
import UserInfo from '../UserInfo/UserInfo.jsx';
import Loader from '../Loader/Loader.jsx';
import UserAvatar from '../UserAvatar/UserAvatar.jsx';
import { userPropType } from './../../data-shapes/user.js';

const mapStateToProps = (state, { url }) => {
    const user = appState.user.getUserByURL(state, url);

    return { user };
};

const CommunityAvatar = ({ profilePic, name }) => (
    <span>
        <UserAvatar size="medium" img={profilePic} desc={name} />
    </span>
);

CommunityAvatar.propTypes = {
    profilePic: PropTypes.string,
    name: PropTypes.string
};

class CommunityUser extends React.Component {
    static propTypes = {
        fetchUser: PropTypes.func.isRequired,
        user: userPropType,
        onlyAvatar: PropTypes.bool,
        url: PropTypes.string.isRequired
    };

    componentDidMount() {
        this.props.fetchUser(this.props.url);
    }

    render() {
        const { user, onlyAvatar } = this.props;

        if (onlyAvatar) {
            return user ?
                <CommunityAvatar {...user} /> :
                (<div className="text-align--center"><Loader /></div>);
        }

        return user ? (
            <UserInfo
              img={user.profilePic}
              name={user.name}
              quote={<TruncatedText text={user.ownerPropertyIntro} limit={80} />}
              fullWidth
            />
        ) : (<div className="text-align--center"><Loader /></div>);
    }

}

export default connect(mapStateToProps, {
    fetchUser: actions.user.fetchUser
})(CommunityUser);
