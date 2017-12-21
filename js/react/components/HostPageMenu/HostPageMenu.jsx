import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';

import { actions, getState } from '../../reducers';
import strings from '../../constants/strings.js';
import './HostPageMenu.scss';

const mapObj = (obj, fn) =>
    Object.entries(obj).map(([key, val], idx) => fn(val, key, idx));

const mapStateToProps = (state) => {
    const userId = getState.session.userId(state);
    const user = getState.user.getUser(state, userId);
    const awaitingExperiencesCounter = getState.hostExperiences.getAwaitingExperiencesCounter(state);
    const awaitingResponsesCounter = getState.hostProperties.getAwaitingResponsesCounter(state);

    return { user, awaitingExperiencesCounter, awaitingResponsesCounter };
};

class HostPageMenu extends React.Component {
    static propTypes = {
        awaitingResponsesCounter: PropTypes.number,
        awaitingExperiencesCounter: PropTypes.number,
        fetchAwaitingExperiencesCounter: PropTypes.func.isRequired,
        fetchAwaitingResponsesCounter: PropTypes.func.isRequired
    }

    constructor(props, context) {
        super(props);

        this.listClassName = this.listClassName.bind(this);
        this.getAwaitingCount = this.getAwaitingCount.bind(this);
        this.handleMenuItemChange = this.handleMenuItemChange.bind(this);
        this.canShowMenu = this.canShowMenu.bind(this);

        this.state = {
            currentRoute: window.location.pathname
        };
    }

    componentDidMount() {
        this.props.fetchAwaitingResponsesCounter();
        // this.props.fetchAwaitingExperiencesCounter();
    }

    getAwaitingCount(type) {
        const { awaitingExperiencesCounter, awaitingResponsesCounter } = this.props;
        if (type === 'experiences') {
            return awaitingExperiencesCounter || 0;
        }

        if (type === 'properties') {
            return awaitingResponsesCounter || 0;
        }

        return 0;
    }

    canShowMenu(type) {
      const { user } = this.props;

      switch (type) {
        case 'properties':
            return user && user.hasProperties;
        case 'experiences':
            return user && user.hasExperiences;
        default:
            return true;
      }
    }

    listClassName(item) {
        const { currentRoute } = this.state;
        return (item.href === currentRoute && 'active' : 'inactive');
    }

    handleMenuItemChange(event) {
        this.setState({ currentRoute: event.target.value });
        this.props.history.push(event.target.value);
    }

    render() {
        const { currentRoute } = this.state;

        const countSpan = count =>
            <span className="label host__menu__label--warn"> {count} </span>;

        const subMenu = (items, awaitingCount) => mapObj(items, (item, key) => (
            <li key={key} className={this.listClassName(item)}>
                <Link to={item.href} className="host__menu__link">
                    {item.caption}
                    {key === 'awaiting' && countSpan(awaitingCount)}
                </Link>
            </li>
        ));

        const sideMenu = mapObj(strings.hostMenuItems, (menu, menuKey) => {
            if (this.canShowMenu(menuKey)) {
                return (
                    <ul className="host__menu show-for-medium menu vertical" key={menuKey}>
                        {subMenu(menu, this.getAwaitingCount(menuKey))}
                    </ul>
                );
            }
        });

        const options = mapObj(strings.hostMenuItems, (menu, menuKey) =>
            mapObj(menu, (item, key) => (
                <option key={`${menuKey}-${key}`} value={item.href}>
                    {item.caption}
                </option>
            )));

        return (
            <div>
                { sideMenu }

                <select
                  className="host__menu hide-for-medium"
                  onChange={this.handleMenuItemChange}
                  value={currentRoute}
                >
                    { options }
                </select>
            </div>
        );
    }
}

export default withRouter(connect(mapStateToProps, {
    fetchAwaitingExperiencesCounter: actions.hostExperiences.fetchAwaitingExperiencesCounter,
    fetchAwaitingResponsesCounter: actions.hostProperties.fetchAwaitingResponsesCounter
})(HostPageMenu));
