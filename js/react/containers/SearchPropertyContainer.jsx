import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { actions, getState as appState } from '../reducers';
import { eventPropertyType } from '../data-shapes/property.js';
import { userPropType } from '../data-shapes/user.js';

import SearchProperty from '../components/SearchProperty/SearchProperty.jsx';

const mapStateToProps = (state, { ownerUrl }) => {
    const owner = appState.user.getUserByURL(state, ownerUrl);
    return { owner };
};

class SearchPropertyContainer extends React.Component {
    static propTypes = {
        fetchPropertyOwner: PropTypes.func.isRequired,
        property: eventPropertyType,
        ownerUrl: PropTypes.string,
        owner: userPropType
    }

    constructor(props) {
        super(props);
        this.tiggerPropertyImageModal = this.tiggerPropertyImageModal.bind(this);
        this.state = {
            showPropertyImageModal: false
        };
    }

    componentDidMount() {
        this.fetch(this.props.ownerUrl);
    }

    fetch(ownerUrl) {
        this.props.fetchPropertyOwner(ownerUrl);
    }

    tiggerPropertyImageModal () {
        this.setState({
            showPropertyImageModal: true
        });
    }

    render() {
        const { owner, property } = this.props;
        return (
            <SearchProperty property={property}
                owner={owner}
                showPropertyImageModal={this.state.showPropertyImageModal}
                tiggerPropertyImageModal={this.tiggerPropertyImageModal} />
        );
    }
}

export default connect(
    mapStateToProps, {
        fetchPropertyOwner: actions.user.fetchUser
    }
)(SearchPropertyContainer);
