import React, { PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import idFromURLEnd from '../../lib/idFromURLEnd.js';
import messages from '../../constants/messages.js';

import UserAvatar from './../UserAvatar/UserAvatar.jsx';
import ProfilePicField from '../ExtraInfo/ProfilePicField/ProfilePicField.jsx';
import './UserProfileBadge.scss';

const UserProfileBadge = (props) => {
    const { fullName, firstName, lastName, email, phone, ownerPropertyIntro, profilePic, city, state, country, dateOfBirth, gender, url } = props;
    const { updateUserData, showMessageModal } = props;
    const { handleSubmit } = props;

    const submit = async ({ picture }) => {
        const userData = { picture };
        const { default: phoneNumber } = await import('../../lib/phoneNumber.js');
        const parsedNum = phoneNumber(phone);

        userData.firstName = firstName;
        userData.lastName = lastName;
        userData.email = email || '';
        userData.city = city || '';
        userData.state = state || '';
        userData.country = country || '';
        userData.profilePic = profilePic || '';
        userData.code = parsedNum.code;
        userData.phone = parsedNum.num;
        userData.about = ownerPropertyIntro;
        userData.day = dateOfBirth.day;
        userData.month = dateOfBirth.month;
        userData.year = dateOfBirth.year;
        userData.gender = gender;

        updateUserData(userData, idFromURLEnd(url)).then(() => {
            showMessageModal(
                'Message',
                messages.USER_PROFILE_EDIT_SUCCESS
            );
        }).catch((err) => {
            showMessageModal(
                'Message',
                messages.errors.USER_PROFILE_EDIT
            );
            throw Error(err);
        });
    };
    return (
        <div className="UserProfileBadge">
            <div className="UserProfileBadge-ProfilePic show-for-medium">
                <ProfilePicField
                  userData={{ name: fullName, profilePic }}
                  submitOnChange
                  extralarge
                  onSubmit={submit}
                />
            </div>
            <div className="UserProfileBadge-content">
                <div className="UserProfileBadge--name">{ fullName }</div>
                <div>{ email }</div>
                <div>{ phone }</div>
                <div>{ city }</div>
            </div>
            <div className="hide-for-medium" style={{ float: 'right' }}>
                <ProfilePicField
                  userData={{ name: fullName, profilePic }}
                  submitOnChange
                  onSubmit={submit}
                />
            </div>
            <div className="UserProfileBadge--ownerIntro">{ownerPropertyIntro}</div>
        </div>
    );
};

UserProfileBadge.propTypes = {
    fullName: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    ownerPropertyIntro: PropTypes.string,
    profilePic: PropTypes.string,
    city: PropTypes.string,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    dateOfBirth: PropTypes.shape({
        day: PropTypes.string,
        month: PropTypes.string,
        year: PropTypes.string
    }).isRequired,
    gender: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    updateUserData: PropTypes.func.isRequired,
    showMessageModal: PropTypes.func.isRequired
};

export default reduxForm({
    form: 'edit-user-profile-pic'
})(UserProfileBadge);
