import React, { PropTypes } from 'react';
import { Field, Fields, propTypes as formPropTypes, reduxForm } from 'redux-form';

import {
    createValidator,
    nameValidation,
    phoneValidation,
    emailValidation,
    dayValidation,
    genderValidation,
    monthValidation,
    yearValidation,
    passwordValidation,
    termsValidation,
    pictureValidation,
    ageValidation
} from '../../lib/validations.js';

import ModalSignupSuccessContainer from '../../containers/ModalSingupSuccessContainer.jsx';
import InputField from '../InputField/InputField.jsx';
import ButtonLoader from '../ButtonLoader/ButtonLoader.jsx';
import FBLoginButtonContainer from '../../containers/FBLoginButtonContainer.jsx';
import ProfileIcon from '../Icons/ProfileIcon.jsx';
import SeePassword from '../Icons/SeePassword.jsx';
import HidePassword from '../Icons/HidePassword.jsx';

import '../SignupManual/SignupManual.scss';
import './SignupForm.scss';

export const phoneFields = (fields) => {
    const { phone } = fields;
    const { touched, error } = phone.meta;
    const { transientLabel } = fields;

    return (
        <div>
            <fieldset className="FieldSet" style={{ border: 'none', marginBottom: '0.5rem' }}>
                <Field
                  type="text"
                  name="countryCode"
                  component={InputField}
                  placeholder="91"
                  align="center"
                  varient="signupSmall"
                  label={transientLabel && "CountryCode"}
                  transientLabel={transientLabel}
                />
                <Field
                  type="number"
                  name="phone"
                  component={InputField}
                  placeholder="Mobile No."
                  hideError
                  align="left"
                  varient="signin-modal"
                  label={transientLabel && "Phone No."}
                  transientLabel={transientLabel}
                />
            </fieldset>
            {touched && <div className="f6 w-100 light-red">{error}</div>}
        </div>
    );
};

class SignupForm extends React.Component {
    static defaultProps = {
        loggedInFromFb: false,
        isAlreadyVerified: false,
        submitSuccess: false,
        shouldRedirectAfterSignup: false,
        isLoggingWithFb: false
    }

    static propTypes = {
        ...formPropTypes,
        loggedInFromFb: PropTypes.bool,
        isAlreadyVerified: PropTypes.bool,
        submitSuccess: PropTypes.bool,
        shouldRedirectAfterSignup: PropTypes.bool,
        isLoggingWithFb: PropTypes.bool,
        missingInfo: PropTypes.bool.isRequired,
        handleSubmit: PropTypes.func.isRequired,
        verifyCode: PropTypes.func.isRequired,
        errorMessage: PropTypes.func.isRequired,
        showSignupSuccess: PropTypes.func.isRequired,
        sendCode: PropTypes.func.isRequired
    }

    constructor(props) {
        super(props);
        this.getRef = this.getRef.bind(this);
        this.getFileInput = this.getFileInput.bind(this);

        this.state = {};
    }

    componentWillReceiveProps(nextProps) {
        if (this.state.image) {
            return;
        }

        const { userData, loggedInFromFb } = nextProps;
        if (!loggedInFromFb || !(userData && userData.profilePic)) {
            return;
        }
        this.setState({ image: userData.profilePic });
    }

    getRef(ref) {
        this.ref = ref;
    }

    getFileInput({ input, meta: { error, touched } }) {
        return (<div>
            <input
              type="file"
              style={{ display: 'none' }}
              ref={this.getRef}
              onChange={(e) => {
                  e.preventDefault();
                  const file = e.target.files[0];
                  input.onChange(file);

                  if (file) {
                      const reader = new FileReader(); // eslint-disable-line no-undef
                      reader.onloadend = () => {
                          this.setState({ image: reader.result });
                      };
                      reader.readAsDataURL(file);
                  }
              }}
              accept="image/*"
            />
            { touched && <div className="f6 w-100 tc light-red">{error}</div> }
        </div> );
    }

    render() {
        const { loggedInFromFb, signupFormValues, isAlreadyVerified, submitSuccess, history, shouldRedirectAfterSignup, loggingFromFb, missingInfo, userData } = this.props;
        const { invalid, dirty, submitting, submitFailed, valid, error } = this.props;
        const { handleSubmit, verifyCode, sendCode, errorMessage, showSignupSuccess } = this.props;

        const form = (
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
                <div className="w-75 fl mb2">
                    <fieldset className="FieldSet SignupForm__username_fieldset" style={{ border: 'none', marginBottom: '0.5rem' }}>
                        <Field
                          type="text"
                          name="firstName"
                          component={InputField}
                          placeholder="First Name"
                          autofocus
                          align="left"
                          varient="signin-modal"
                        />
                        <Field
                          type="text"
                          name="lastName"
                          component={InputField}
                          placeholder="Last Name"
                          align="left"
                          varient="signin-modal"
                        />
                    </fieldset>
                    <div className="relative" style={{ marginBottom: '1.9rem' }}>
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
                        <span
                          className="absolute"
                          style={{
                              left: 0,
                              bottom: '-1.1rem',
                              fontSize: '0.7rem',
                              fontWeight: 400
                          }}
                        > CountryCode</span>
                        <Fields
                          names={['countryCode', 'phone']}
                          component={phoneFields}
                        />
                    </div>
                    <div className="pt2">
                        <Field
                          type="email"
                          name="email"
                          placeholder="Email"
                          component={InputField}
                          isAlreadyVerified={isAlreadyVerified}
                          align="left"
                          varient="signin-modal"
                        />
                    </div>
                    { !loggedInFromFb && <div>
                        <div className="pt3 relative">
                            <Field
                              type={this.state.showPassword ? 'text' : 'password'}
                              id="password"
                              name="password"
                              placeholder="Password"
                              component={InputField}
                              align="left"
                              varient="signin-modal"
                            />
                            { !this.state.showPassword && <div className="absolute w-10" style={{ right: 0, top: '1rem' }}>
                                <SeePassword onClick={() => this.setState({ showPassword: true })} />
                            </div> }
                            { this.state.showPassword && <div className="absolute w-10" style={{ right: 0, top: '1rem' }}>
                                <HidePassword onClick={() => this.setState({ showPassword: false })} />
                            </div> }
                        </div>
                        <div className="pt3 relative">
                            <Field
                              type={this.state.showRepeatPassword ? 'text' : 'password'}
                              id="cpassword"
                              name="cpassword"
                              placeholder="Repeat Password"
                              component={InputField}
                              align="left"
                              varient="signin-modal"
                            />
                            { !this.state.showRepeatPassword && <div className="absolute w-10" style={{ right: 0, top: '1rem' }}>
                                <SeePassword onClick={() => this.setState({ showRepeatPassword: true })} />
                            </div> }
                            { this.state.showRepeatPassword && <div className="absolute w-10" style={{ right: 0, top: '1rem' }}>
                                <HidePassword onClick={() => this.setState({ showRepeatPassword: false })} />
                            </div> }
                        </div>
                    </div> }
                    <div className="input-set SignupForm__gendercontainer pv3">
                        <div className="w-50">
                            <Field
                              label="Male"
                              type="radio"
                              name="gender"
                              value="male"
                              id="gender_male"
                              component={InputField}
                              align="left"
                              varient="signin-modal"
                              floatLabel
                            />
                        </div>
                        <Field
                          label="Female"
                          type="radio"
                          name="gender"
                          value="female"
                          id="gender_female"
                          component={InputField}
                          align="left"
                          varient="signin-modal"
                          floatLabel
                          hideError
                        />
                    </div>
                    <Field
                      type="number"
                      name="age"
                      placeholder="Age"
                      component={InputField}
                      align="left"
                      varient="signin-modal"
                    />
                </div>
                <div className="fr w-25 pl2 ProfileIconContainer">
                    { !this.state.image && <div>
                        <ProfileIcon onClick={() => this.ref.click()} />
                        <p
                          className="w-100 tc red"
                          style={{
                              bottom: '0.9rem',
                              fontSize: '0.7rem',
                              pointerEvents: 'none'
                          }}
                        >Add Photo</p>
                    </div> }
                    { (loggedInFromFb || this.state.image) && <div className="dib relative w-100">
                        <div style={{ marginTop: '100%' }}>
                            <img
                              src={this.state.image}
                              alt="Profile Pic"
                              className="aspect-ratio--object shadow-1pr4"
                              onClick={() => this.ref.click()}
                            />
                        </div>
                    </div> }
                    <Field
                      component={this.getFileInput}
                      name="picture"
                    />
                </div>
                { !error && !valid && submitFailed && <div className="cb tc ph1 pt1 fw5 light-red">Error: Please see above</div> }
                {error && <div className="cb tc pa1 fw5">{error}</div>}
                <div className="cb">
                    <ButtonLoader
                      type="submit"
                      showSpinner={submitting}
                      expanded
                      rounded
                      largeText
                    >
                        { loggedInFromFb ? 'UPDATE PROFILE' : 'SIGN UP' }
                    </ButtonLoader>
                </div>
            </form>
        );

        const userForm = (
            <div>
                {!loggedInFromFb && <div className="w-80" style={{ margin: 'auto' }}>
                    <FBLoginButtonContainer
                      buttonText="Fetch from Facebook"
                      history={history}
                      signup
                    />
                </div> }
                { !loggedInFromFb && <div
                  className="w-100 tc mv4"
                  style={{
                      position: 'relative',
                      border: '1px solid #ffbcbd'
                  }}
                >
                    <span className="tc Login-modal-separator">or</span>
                </div> }
                {form}
            </div>
        );

        return (
            <div style={{ display: 'table', width: '100%' }}>
                <div>
                    {userForm}
                </div>
                <ModalSignupSuccessContainer />
            </div>
        );
    }
}

export default reduxForm({
    form: 'signup-form',
    destroyOnUnmount: false,
    validate: createValidator({
        firstName: nameValidation,
        lastName: nameValidation,
        phone: phoneValidation,
        email: emailValidation,
        day: dayValidation,
        month: monthValidation,
        year: yearValidation,
        gender: genderValidation,
        password: passwordValidation,
        cpassword: passwordValidation,
        terms: termsValidation,
        picture: pictureValidation,
        age: ageValidation
    })
})(SignupForm);
