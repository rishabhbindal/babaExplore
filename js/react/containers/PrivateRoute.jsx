import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import React, { PropTypes } from 'react';

import { actions, getState } from '../reducers';
import LoginModalContainer from './LoginModalContainer.jsx';

const mapStateToProps = (state) => {
    const isResolved = getState.session.isResolved(state);
    const userId = getState.session.userId(state);
    const user = getState.user.getUser(state, userId);
    const isLoggedIn = getState.session.hasSession(state);
    const { login } = state;

    return {
        isResolved,
        user,
        isLoggedIn,
        loginModalVisibility: login.visible
    };
};

class PrivateRoute extends React.Component {
    static propTypes = {
        isLoggedIn: PropTypes.bool,
        isResolved: PropTypes.bool,
        loginModalVisibility: PropTypes.bool,
        component: PropTypes.oneOfType([PropTypes.element, PropTypes.func]).isRequired,
        setSession: PropTypes.func.isRequired,
        toggleLoginModalVisibility: PropTypes.func.isRequired
    }

    static defaultProps = {
        isLoggedIn: false,
        isResolved: false,
        loginModalVisibility: false
    }

    constructor(props) {
        super(props);
        const { isResolved, isLoggedIn } = props;
        const { toggleLoginModalVisibility } = props;

        if (!isResolved || isLoggedIn) {
            return;
        }
        toggleLoginModalVisibility(true);
    }

    componentWillMount() {
        this.fetchData();
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.isResolved) {
            this.fetchData();
        }
    }

    fetchData() {
        this.props.setSession();
    }

    render() {
        const { isLoggedIn, component, ...rest } = this.props;
        if (!this.props.isResolved) {
            return null;
        }

        if (isLoggedIn) {
            return (
                <Route
                  {...rest}
                  render={props => React.createElement(component, props)}
                />
            );
        }

        return (
            <div>
                <LoginModalContainer />
                <div className="w-100 pa4 tc">
                    <h4>You need to be logged in to view this page</h4>
                </div>
            </div>
        );
    }
}

export default connect(mapStateToProps, {
    setSession: actions.session.setSession,
    toggleLoginModalVisibility: actions.login.toggleLoginModalVisibility
})(PrivateRoute);
