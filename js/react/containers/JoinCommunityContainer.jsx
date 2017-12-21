import { connect } from 'react-redux';
import React, { PropTypes } from 'react';
import { actions, getState as appState } from '../reducers';

import Loader from './../components/Loader/Loader.jsx';
import Button from './../components/Button/Button.jsx';
import ButtonLoader from './../components/ButtonLoader/ButtonLoader.jsx';
import JoinCommunityRequestFormContainer from './JoinCommunityRequestFormContainer.jsx';
import MissingDetailsModalContainer from './MissingDetailsModalContainer.jsx';
import { userPropType } from './../data-shapes/user.js';
import { groupRequestPropType } from './../data-shapes/group.js';
import messages from '../constants/messages.js';

const mapStateToProps = (state, { communityName }) => {
    const isLoggedIn = appState.session.hasSession(state);
    const userId = appState.session.userId(state);
    const user = appState.user.getUser(state, userId);
    const pendingRequest = appState.community.getJoinRequests(state, communityName);
    const isLoading = appState.community.joinRequestStatus(state) || false;
    const isCreating = appState.community.createRequestStatus(state) || false;

    return { isLoggedIn, user, pendingRequest, isLoading, isCreating };
};

class CommunityPageContainer extends React.Component {
    static propTypes = {
        user: userPropType,
        pendingRequest: groupRequestPropType,
        communityName: PropTypes.string.isRequired,
        toggleLogin: PropTypes.func.isRequired,
        fetchJoinRequests: PropTypes.func.isRequired,
        showJoinCommunitiesModal: PropTypes.func.isRequired,
        isLoading: PropTypes.bool.isRequired,
        isCreating: PropTypes.bool.isRequired,
        shouldShowMissingDetailsModal: PropTypes.func.isRequired
    };

    constructor(props) {
        super(props);

        this.handleLoginClick = this.handleLoginClick.bind(this);
        this.handleJoinClubClick = this.handleJoinClubClick.bind(this);
    }

    componentDidMount() {
        const { communityName, isLoggedIn } = this.props;
        if (isLoggedIn) {
            this.props.fetchJoinRequests(communityName);
        }
    }

    handleLoginClick() {
        this.props.toggleLogin(true);
    }

    handleJoinClubClick() {
        const { user } = this.props;
        if (
            !user.fullName ||
            !user.phone ||
            (user.email && user.email.indexOf('@example.com') !== -1)
        ) {
            this.props.shouldShowMissingDetailsModal(true);
            return;
        }
        this.props.showJoinCommunitiesModal();
    }

    render() {
        const { communityName, isLoggedIn, pendingRequest, user, isLoading, isCreating } = this.props;
        const { MISSING_DETAILS_COMMUNITY_MODAL_MESSAGE } = messages;
        const alreadyJoined = user && user.groups.includes(communityName);
        const isRequestPending = !!pendingRequest;
        const canRequestToJoin = (isLoggedIn && !alreadyJoined);

        return (
            <div style={{ marginTop: '1rem' }}>
                { !isLoggedIn && <Button onClick={this.handleLoginClick}>Join the Club</Button> }
                { canRequestToJoin && isRequestPending && <Button>Request pending approval</Button> }
                {
                    !isLoading && canRequestToJoin && !isRequestPending &&
                    <ButtonLoader onClick={this.handleJoinClubClick} showSpinner={isCreating}>
                        Join the club
                    </ButtonLoader>
                }
                { isLoading && <div className="text-align--center"><Loader /></div> }
                <JoinCommunityRequestFormContainer communityName={communityName} />
                <MissingDetailsModalContainer
                  message={MISSING_DETAILS_COMMUNITY_MODAL_MESSAGE}
                />
            </div>
        );
    }
}

export default connect(mapStateToProps, {
    toggleLogin: actions.login.toggleLoginModalVisibility,
    fetchJoinRequests: actions.community.fetchJoinRequests,
    showJoinCommunitiesModal: actions.modals.showJoinCommunitiesModal,
    shouldShowMissingDetailsModal: actions.modals.shouldShowMissingDetailsModal
})(CommunityPageContainer);
