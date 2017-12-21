import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import { actions, getState as appState } from '../reducers';
import { eventPropertyType } from '../data-shapes/property.js';
import { userPropType } from './../data-shapes/user.js';
import HostPropertyDetails from '../components/HostPropertyDetails/HostPropertyDetails.jsx';
import HostPropertyDetailsMenu from '../components/HostPropertyDetailsMenu/HostPropertyDetailsMenu.jsx';
import HostCreateOrderContainer from './HostCreateOrderContainer.jsx';

const mapStateToProps = (state, { propertyId }) => {
    const userId = appState.session.userId(state);
    const user = appState.user.getUser(state, userId);
    const order = appState.hostProperties.getOrder(state);
    const property = appState.hostProperties.getProperty(state, propertyId) || appState.hostExperiences.getExperience(state, propertyId);
    const isPropertyUpdating = appState.hostProperties.isPropertyUpdating(state) || false;

    return { user, order, property, isPropertyUpdating };
};

class HostPropertyDetailsContainer extends React.Component {
    static propTypes = {
        user: userPropType.isRequired,
        property: eventPropertyType.isRequired,
        updateProperties: PropTypes.func.isRequired,
        isPropertyUpdating: PropTypes.bool.isRequired
    }

    constructor(props) {
        super(props);
        this.handleMenuChange = this.handleMenuChange.bind(this);

        this.state = {
            activeItem: 'edit-properties'
        };
    }

    handleMenuChange = (event) => {
        this.setState({ activeItem: event.target.dataset.value });
    }

    render() {
        const { property, isPropertyUpdating, user } = this.props;
        const { activeItem } = this.state;
        return (
            <div>
                {
                    user.canCreateHostOrder &&
                    property &&
                    property.bookableItems.length > 0 &&
                    property.status === 'PUBLISHED' &&
                    <HostPropertyDetailsMenu activeItem={activeItem} handleMenuItemChange={this.handleMenuChange} />
                }
                {
                    property &&
                    property.status === 'PUBLISHED' &&
                    <p>
                        { /* handle events properly for the link when they are enables in the dashboard */ }
                        <a href={`/listing/${property.code}`} target="_blanks">See this Listing</a>
                    </p>
                }
                {
                    activeItem &&
                    activeItem === 'create-order' &&
                    <HostCreateOrderContainer property={property} />
                }
                {
                    activeItem &&
                    activeItem === 'edit-properties' &&
                    <HostPropertyDetails
                      property={property}
                      user={user}
                      updateProperties={this.props.updateProperties}
                      isPropertyUpdating={isPropertyUpdating}
                    />
                }
            </div>
        );
    }
}

export default connect(
    mapStateToProps, {
        updateProperties: actions.hostProperties.updateProperties
    }
)(HostPropertyDetailsContainer);
