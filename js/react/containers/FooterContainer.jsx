import React, { PropTypes } from 'react';

import { connect } from 'react-redux';

import { actions, getState } from '../reducers';

import Footer from '../components/Footer/Footer.jsx';
import MessageModalContainer from './MessageModalContainer.jsx';

const mapStateToProps = (state) => {
    const cities = getState.appConfig.cities(state);
    const groupNames = getState.appConfig.groupNames(state).slice(0, 8);

    return { cities, groupNames };
};

class FooterContainer extends React.Component {
    static propTypes = {
        fetchAppConfig: PropTypes.func,
        fetchGroups: PropTypes.func,
        showMessageModal: PropTypes.func
    }

    componentDidMount() {
        this.fetchData();
    }

    fetchData() {
        const { cities, groupNames } = this.props;

        if (!cities.length) {
            this.props.fetchAppConfig();
        }

        if (!groupNames.length) {
            this.props.fetchGroups();
        }
    }

    render() {
        const { cities, groupNames } = this.props;
        return (
            <div>
                <Footer {...this.props} />
                <MessageModalContainer />
            </div>
            );
    }
}

export default connect(mapStateToProps, {
    fetchAppConfig: actions.appConfig.fetchAppConfig,
    fetchGroups: actions.appConfig.fetchGroups,
    showMessageModal: actions.modals.showMessageModal
})(FooterContainer);
