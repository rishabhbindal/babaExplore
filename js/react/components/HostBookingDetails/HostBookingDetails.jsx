import React from 'react';
import { userPropType } from '../../data-shapes/user.js';

import TruncatedText from '../TruncatedText/TruncatedText.jsx';
import UserInfo from '../UserInfo/UserInfo.jsx';
import Loader from '../Loader/Loader.jsx';
import HostBookableDetails from '../HostBookableDetails/HostBookableDetails.jsx';

const HostBookingDetails = ({ owner, order }) => {
    const isOrderEmpty = (Object.keys(order).length <= 0);

    const panelContent = (!isOrderEmpty && !!owner && (
        <div className="row">
            <div className="host__info">
                <UserInfo
                  img={owner.profilePic}
                  name={owner.name}
                  quote={<TruncatedText text={owner.ownerPropertyIntro} limit={60} />}
                  fullWidth
                />
            </div>
            <hr className="hide-for-medium" />
            <div className="host__bookings">
                <HostBookableDetails {...order} />
            </div>
            {
                order.hostMessage && order.hostMessage.length && (
                    <div>
                        <hr />
                        <div className="host__message">
                            <small className="title">Host Message </small>
                            <br />
                            { order.hostMessage }
                        </div>
                    </div>
                )
            }
            <hr className="hide-for-medium" />
        </div>
    ));

    return (
        (!!owner && !isOrderEmpty) ?
        (panelContent) :
        (<div className="text-align--center"><Loader size="large" /></div>)
    );
};

HostBookingDetails.propTypes = {
    owner: userPropType
};

export default HostBookingDetails;
