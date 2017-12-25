import React, { PropTypes } from 'react';
import { Link } from 'react-router-dom';

import UserProfileBadge from './../UserProfileBadge/UserProfileBadge.jsx';
import UserAvatar from './../UserAvatar/UserAvatar.jsx';
import UserChangePasswordFormContainer from './../../containers/UserChangePasswordFormContainer.jsx';
import UserDashboardPendingOrders from './../UserDashboardPendingOrders/UserDashboardPendingOrders.jsx';
import UserDashboardOrders from './../UserDashboardOrders/UserDashboardOrders.jsx';
import UserEditProfileFormContainer from './../../containers/UserEditProfileFormContainer.jsx';
import './UserDashboard.scss';

const CommunityItem = ({ name, coverImage = {} }) => (
    <Link className="CommunityItem" to={`/community/${name}`}>
        <span className="CommunityItem-avatar">
            <UserAvatar img={coverImage.image} desc={name} size="small" />
        </span>
        <span className="CommunityItem-text">{ name }</span>
    </Link>
);

CommunityItem.propTypes = {
    name: PropTypes.string
};

class UserDashboard extends React.Component {
    static propTypes = {
        user: PropTypes.object,
        existingOrders: PropTypes.object,
        removePendingOrder: PropTypes.func.isRequired,
        existingOrderDeleting: PropTypes.bool.isRequired,
        updateUserData: PropTypes.func.isRequired,
        showMessageModal: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.handleEditProfile = this.handleEditProfile.bind(this);
        this.handleChangePassword = this.handleChangePassword.bind(this);
        this.closeForm = this.closeForm.bind(this);

        this.state = {
            showChangePassword: false,
            showEditProfile: false
        };
    }

    handleChangePassword() {
        const { showChangePassword } = this.state;
        this.setState({ showChangePassword: !showChangePassword });
    }

    handleEditProfile() {
        const { showEditProfile } = this.state;
        this.setState({ showEditProfile: !showEditProfile });
    }

    closeForm() {
        this.setState({
            showChangePassword: false,
            showEditProfile: false
        });
    }

    render() {
        const { user, existingOrders, existingOrderDeleting, updateUserData, showMessageModal } = this.props;
        const { showEditProfile, showChangePassword } = this.state;

        const canChangeProfile = (!showEditProfile && !showChangePassword)
        return (
            <div className="row">
                <div className="UserDashboard-LeftPanel">
                    <UserProfileBadge {...user} updateUserData={updateUserData} showMessageModal={showMessageModal} />
                    {
                        !showEditProfile && !showChangePassword &&
                        <center>
                            <button className="small button hollow secondary" onClick={this.handleEditProfile}>
                                Edit Profile
                            </button>
                            <br />
                            <button className="small button hollow secondary" onClick={this.handleChangePassword}>
                                Change Password
                            </button>
                        </center>
                    }
                    {
                        this.state.showEditProfile &&
                        <UserEditProfileFormContainer closeForm={this.closeForm} />
                    }
                    {
                        this.state.showChangePassword &&
                        <UserChangePasswordFormContainer closeForm={this.closeForm} />
                    }
                    <hr />
                    {
                        user.groupsInfo.length > 0 && (
                            <div className="column">
                                <h5>Your Communities</h5>
                                {
                                    user.groupsInfo.map(({ name, images }) =>
                                        <CommunityItem name={name} coverImage={images[0]} key={name} />
                                    )
                                }
                            </div>
                        )
                    }
                </div>
                <div className="UserDashboard-RightPanel">
                    <UserDashboardPendingOrders
                      {...existingOrders}
                      isLoading={existingOrderDeleting}
                      removePendingOrder={this.props.removePendingOrder}
                    />
                    <UserDashboardOrders />
                </div>
            </div>
        );
    }
}

export default UserDashboard;
