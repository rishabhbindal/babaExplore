import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { actions, getState as appState } from '../reducers';
import { eventPropertyType } from '../data-shapes/property.js';
import { userPropType } from '../data-shapes/user.js';

import PreviewProperty from '../components/PreviewProperty/PreviewProperty.jsx';

const mapStateToProps = (state, { ownerUrl }) => {
    const owner = appState.user.getUserByURL(state, ownerUrl);
    return { owner };
};

class PreviewPropertyContainer extends React.Component {
    static propTypes = {
        fetchPreviewPropertyOwner: PropTypes.func.isRequired,
        property: eventPropertyType,
        ownerUrl: PropTypes.string,
        owner: userPropType
    }

    componentDidMount() {
        this.fetch(this.props.ownerUrl);
    }

    fetch(ownerUrl) {
        this.props.fetchPreviewPropertyOwner(ownerUrl);
    }

    render() {
        const { owner, property } = this.props;

        return (
            <PreviewProperty
              owner={owner}
              property={property}
            />
        );
    }
}

export default connect(
    mapStateToProps, {
        fetchPreviewPropertyOwner: actions.user.fetchUser
    }
)(PreviewPropertyContainer);
