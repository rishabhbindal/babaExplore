import React, { PropTypes } from 'react';

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';

import { actions as appActions, getState as appState } from '../reducers';
import { userPropType } from '../data-shapes/user.js';


const mapStateToProps = (state) => {
    const isLoading = appState.session.isFetching(state);
    const userId = appState.session.userId(state);
    const user = appState.user.getUser(state, userId);
    const isLoggedIn = appState.session.hasSession(state);

    return { isLoading, user, isLoggedIn };
};


class CheckMissingDetails extends React.Component {
    static propTypes = {
        isLoggedIn: PropTypes.bool.isRequired,
        user: userPropType,
        setSession: PropTypes.func.isRequired
    }

    static defaultProps = {
        user: null
    }

    componentWillMount() {
        this.fetchData();

        if (this.props.isLoggedIn) {
            this.checkAndRedirect();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isLoggedIn
            && nextProps.user && (this.props.user && this.props.user.email) !== nextProps.user.email
        ) {
            this.checkAndRedirect(nextProps);
        }
    }

    fetchData() {
        this.props.setSession();
    }

    checkAndRedirect(props) {
        const { location, history } = props || this.props;
        const { user } = props || this.props;

        if (location.pathname !== '/missing-details' && location.hash !== '#signup'
            && user && (user.isDefaultProfilePic || !user.ownerPropertyIntro
                || !user.phone || !user.dateOfBirth.year)
        ) {
            history.push('/missing-details');
        }
    }

    render() {
        return null;
    }
}

export default withRouter(connect(mapStateToProps, {
    setSession: appActions.session.setSession
})(CheckMissingDetails));
