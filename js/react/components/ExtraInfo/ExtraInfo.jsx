import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Field, Fields, propTypes as formPropTypes, reduxForm } from 'redux-form';
import { Redirect, withRouter } from 'react-router-dom';
import { getState } from '../../reducers';

import { userPropType } from '../../data-shapes/user.js';

import './ExtraInfo.scss';

import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import ProfilePicField from './ProfilePicField/ProfilePicField.jsx';
import PromotedUsers from '../PromotedUsers/PromotedUsers.jsx';
import { phoneFields } from '../SignupForm/SignupForm.jsx';
import InputField from '../InputField/InputField.jsx';

import { extraInfoValidator } from '../../lib/validations.js';

const mapStateToProps = (state, { promotedUsers }) => {
    const users = promotedUsers.map(url => getState.user.getUserByURL(state, url))
        .filter(Boolean);
    return { users };
};

const userDesc = ({ input, meta: { touched, error } }) => (
    <div>
        <textarea {...input} rows="3"  className="mb1" placeholder=" Example: designer || entrepreneur || Traveller " />
        {touched && error && <span className="f6 w-100 tl light-red">{error}</span>}
    </div>
);

class ExtraInfo extends React.Component {
    static propTypes = {
        ...formPropTypes,
        putUserData: PropTypes.func,
        userId: PropTypes.string,
        userData: userPropType,
        dataSent: PropTypes.bool,
        fetchUser: PropTypes.func
    }

    componentDidMount() {
        const { userData, promotedUsers } = this.props;
        if (userData) {
            promotedUsers.forEach(url => this.props.fetchUser(url));
        }
    }

    render() {
        const { userData, users } = this.props;
        const { submitting, pristine, submitFailed } = this.props;
        const { history, error } = this.props;

        return (
            <div className="ExtraInfo__container relative">
                { !!users.length && <div className="relative dn db-ns">
                    <div className="absolute ExtraInfo--desktop-carousel">
                        <p className="ph2 ma0 fw4 f4">Example Guest Profiles</p>
                        <PromotedUsers users={users} />
                    </div>
                </div> }
                <form className="ExtraInfo" onSubmit={this.props.handleSubmit}>
                    <h4 className="ExtraInfo__heading fw3 pv2 pt4-ns">Oops! Missing Details </h4>
                    <div className="ExtraInfo__fields pt3">
                        <div className="ExtraInfo__avatar w-100">
                            { <ProfilePicField userData={userData} /> }
                        </div>
                        <div className="ExtraInfo__narrow">
                            <fieldSet className="Extrainfo--fieldset">
                                <Field
                                  type="text"
                                  component={InputField}
                                  placeholder="First Name"
                                  name="firstName"
                                  varient="signin-modal"
                                  align="left"
                                  label="First Name"
                                  transientLabel
                                />
                                <Field
                                  type="text"
                                  component={InputField}
                                  placeholder="Last Name"
                                  name="lastName"
                                  varient="signin-modal"
                                  align="left"
                                  label="Last Name"
                                  transientLabel
                                />
                            </fieldSet>
                            <Field
                              type="email"
                              component={InputField}
                              placeholder="Enter email"
                              name="email"
                              varient="signin-modal"
                              align="left"
                              label="Email"
                              transientLabel
                            />
                            <Field
                              type="number"
                              component={InputField}
                              name="age"
                              placeholder="age"
                              varient="signin-modal"
                              align="left"
                              label="Age"
                              transientLabel
                            />
                            <div className="relative">
                                <span
                                  className="absolute"
                                  style={{
                                      width: '0.75rem',
                                      top: '-0.2rem',
                                      left: '-0.75rem',
                                      fontWeight: 300,
                                      color: '#333131'
                                  }}
                                >
                                    +
                                </span>
                                <Fields
                                  names={['countryCode', 'phone']}
                                  component={phoneFields}
                                  transientLabel
                                />
                            </div>
                        </div>
                        <h4
                          className="fw3 pt5 ExtraInfo--desc-heading"
                          style={{ margin: 0, lineHeight: '1.9rem' }}
                        >Words That Defines You Best</h4>
                        <p>Our hosts love hosting interesting people</p>
                        <div className="pa3">
                            <Field
                              type="text"
                              rows="3"
                              component={userDesc}
                              name="about"
                              varient="signin-modal"
                              align="left"
                            />
                        </div>
                    </div>

                    { submitFailed && error && <div className="pa2 pa3-ns f5 black" style={{ marginTop: '-2rem' }}>
                        <p className="ma0">Oops! Unkown Error</p>
                        <p>Please call customer support at +91- 9206071080</p>
                    </div> }

                    <div className="ph3 ph5-ns pb3">
                        <ButtonLoader
                          showSpinner={submitting}
                          rounded
                          expanded
                          largeText
                          type="submit"
                        >
                            Submit
                        </ButtonLoader>
                        <p className="dn-ns pa2 pt4 fw4 f4">Example guest profile</p>
                        { !!users.length && <div className="ExtraInfo--mobile-carousel">
                        <PromotedUsers users={users} />
                        </div> }
                    </div>
                </form>
            </div>
        );
    }
}

export default withRouter(reduxForm({
    form: 'extra-info',
    destroyOnUnmount: false,
    validate: extraInfoValidator
})(connect(mapStateToProps)(ExtraInfo)));
