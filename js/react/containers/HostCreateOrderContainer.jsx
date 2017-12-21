import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { getState as appState } from '../reducers';
import { userPropType } from './../data-shapes/user.js';
import { searchPropertyType } from './../data-shapes/property.js';

import HostOrderVerifyEmailFormContainer from './HostOrderVerifyEmailFormContainer.jsx';
import HostOrderCreateGuestFormContainer from './HostOrderCreateGuestFormContainer.jsx';
import HostCreateOrderFormContainer from './HostCreateOrderFormContainer.jsx';
import UserInfo from '../components/UserInfo/UserInfo.jsx';
import TruncatedText from '../components/TruncatedText/TruncatedText.jsx';

const mapStateToProps = (state, { property }) => {
    const guest = appState.hostCreateOrder.guest(state);
    const inputEmail = appState.hostCreateOrder.inputEmail(state);
    const isActiveProperty = appState.hostCreateOrder.isActiveProperty(state, property.id);

    return { guest, inputEmail, isActiveProperty };
};

const HostOrderGuest = ({ guest, inputEmail, propertyId }) => {
    if (!!inputEmail && inputEmail.length > 0 && !!guest) {
        return (
            <UserInfo
              img={guest.profilePic}
              name={guest.name}
              quote={<TruncatedText text={guest.ownerPropertyIntro} limit={60} />}
              fullWidth
            />
        );
    } else if (!!inputEmail && inputEmail.length > 0) {
        return (<HostOrderCreateGuestFormContainer email={inputEmail} propertyId={propertyId} />);
    }
    return null;
};

HostOrderGuest.propTypes = {
    guest: userPropType,
    inputEmail: PropTypes.string,
    propertyId: PropTypes.number
};

class HostCreateOrderContainer extends React.Component {
    static propTypes = {
        guest: userPropType,
        inputEmail: PropTypes.string,
        property: searchPropertyType,
        isActiveProperty: PropTypes.bool
    };

    render() {
        const { guest, inputEmail, isActiveProperty, property } = this.props;
        const propertyId = property.id;

        return (
            <div>
                <HostOrderVerifyEmailFormContainer propertyId={propertyId} />
                <div className="medium-6 small-12 columns">
                    {
                        isActiveProperty &&
                        <HostOrderGuest guest={guest} inputEmail={inputEmail} propertyId={propertyId} />
                    }
                </div>
                <div className="medium-6 small-12 columns">
                    {
                        isActiveProperty &&
                        !!guest &&
                        <HostCreateOrderFormContainer property={property} guest={guest} />
                    }
                </div>
            </div>
        );
    }
}

export default connect(
    mapStateToProps, {

    }
)(HostCreateOrderContainer);
