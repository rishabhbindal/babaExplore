import { connect } from 'react-redux';
import { SubmissionError, formValueSelector } from 'redux-form';
import React, { PropTypes } from 'react';
import { withRouter } from 'react-router-dom';

import { actions, getState } from '../reducers';
import ExtraInfo from '../components/ExtraInfo/ExtraInfo.jsx';
import Loader from '../components/Loader/Loader.jsx';

const parsePhoneNo = async (number) => {
    if (!number) {
        return;
    }
    const { default: phoneNumber } = await import('./../lib/phoneNumber.js');
    return phoneNumber(number);
};
const mapStateToProps = (state) => {
    // this is a static list of url right now needs to be something fetched from
    // the server in the future
    const promotedUsers = [
        'https://www.explorelifetraveling.com/eltApp/api/v0.1/users/337/',
        'https://www.explorelifetraveling.com/eltApp/api/v0.1/users/2851/',
        'https://www.explorelifetraveling.com/eltApp/api/v0.1/users/1814/'
    ];
    return ({
        userData: getState.user.getUser(state, getState.session.userId(state)),
        userId: getState.session.userId(state),
        promotedUsers
    });
};

class ExtraInfoContainer extends React.Component {
    constructor(props) {
        super(props);
        this.parseNumber = this.parseNumber.bind(this);
        const { userData } = props;
        if (userData && userData.phone) {
            this.parseNumber(userData.phone);
        }
        this.state = {};
    }

    componentWillReceiveProps() {
        const { userData } = this.props;
        if (
            (userData && userData.phone) &&
            !this.parsingNumber &&
            !this.state.parsedNumber
         ) {
            this.parseNumber(userData.phone);
        }
    }

    componentWillUnmount() {
        this.parsingDone = false;
    }

    parseNumber(number) {
        this.parsingNumber = true;
        parsePhoneNo(number).then((res) => {
            this.parsingDone = true;
            this.setState({
                parsedNumber: res
            });
        }).catch(() => {
            this.parsingDone = true;
            this.forceUpdate();
        });
    }

    render() {
        const { history } = this.props;
        /* TODO make sure this does not fail with differently
           structured responses from the server */
        const errorMessage = es =>
            (es && Array.isArray(es) && es.map(a => a.trim()).join(', ')) ||
            (es && typeof es === 'object' && !es.details &&
                Object.keys(es).map(k => `${k}: ${es[k]}`).join(', ')) ||
            (es && typeof es === 'object' && es.details &&
                Object.keys(es.details).map(k => `'${k}': ${es.details[k]}`).join(', ')) ||
            'Error in updating user details';

        const userData = this.props.userData;
        const fullName = userData ? userData.fullName.split(' ') : [];
        const firstName = fullName[0];
        const lastName = fullName.slice(1).join(' ');
        const values = userData && {
            email: userData.email && userData.email.search('@example.com') < 0 ?
                   userData.email : '',
            firstName,
            lastName,
            phone: userData.phone,
            /* dob */
            day: userData.dateOfBirth.day,
            month: userData.dateOfBirth.month,
            year: userData.dateOfBirth.year,

            gender: userData.gender.toLowerCase(),

            about: userData.ownerPropertyIntro,

            profilePic: userData.profilePic,

            city: userData.city,
            state: userData.state,
            country: userData.country,
            streetAddress: userData.streetAddress,

            terms: userData.terms
        };

        const onSubmit = (data) => {
            const getNumberWithCc = (data) => {
                const code = data.countryCode || '91';
                const prefix = code.startsWith('+') ? '' : '+';
                return prefix + code + data.phone;
            };

            const phone = getNumberWithCc(data) || userData.phone;
            const updatedData = { ...userData, ...data, ...{ phone } };
            return this.props.updateUserData(updatedData, this.props.userId)
                .then(() => {
                    history.goBack();
                }).catch((e) => {
                    throw new SubmissionError({
                        _error: errorMessage(e)
                    });
                });
        };

        if (!userData || (userData && userData.phone && !this.parsingDone)) {
            return <div className="w-100 pa4 tc"><Loader /></div>;
        }

        return (
            <ExtraInfo
              {...this.props}
              onSubmit={onSubmit}
              initialValues={{
                  about: userData.ownerPropertyIntro,
                  firstName: userData.firstName,
                  lastName: userData.lastName,
                  countryCode: this.state.parsedNumber && this.state.parsedNumber.code.replace('+', ''),
                  phone: this.state.parsedNumber && this.state.parsedNumber.num,
                  age: userData.age,
                  email: userData.email
              }}
            />
        );
    }
}

export default withRouter(connect(mapStateToProps, {
    updateUserData: actions.user.updateUserData,
    putUserData: actions.user.putUserData,
    showSignupSuccess: actions.modals.showSignupSuccess,
    fetchUser: actions.user.fetchUser
})(ExtraInfoContainer));
