import React, { PropTypes } from 'react';
import { SubmissionError } from 'redux-form';
import { withRouter } from 'react-router-dom';

import './SignupManual.scss';

import StepIndicator from '../StepIndicator/StepIndicator.jsx';
import SignupPhoneAndEmail from '../SignupPhoneAndEmail/SignupPhoneAndEmail.jsx';
import SignupVerifyPhone from '../SignupVerifyPhone/SignupVerifyPhone.jsx';
import SignupFullName from '../SignupFullName/SignupFullName.jsx';
import SignupDOB from '../SignupDOB/SignupDOB.jsx';
import SignupUserAbout from '../SignupUserAbout/SignupUserAbout.jsx';
import SignupPassword from '../SignupPassword/SignupPassword.jsx';
import FbSignupLastStep from '../FbSignupLastStep/FbSignupLastStep.jsx';

import { signupForms } from '../../constants/enumConstants.js';
import messages from '../../constants/messages.js';

import analytics from '../../../lib/analytics.es6.js';

class SignupManual extends React.Component {
    static propTypes = {
        showSignupSuccess: PropTypes.func,
        showMessageModal: PropTypes.func
    }

    constructor(props) {
        super(props);
        this.nextPage = this.nextPage.bind(this);
        this.previousPage = this.previousPage.bind(this);
        this.gotoPage = this.gotoPage.bind(this);
        this.showMessageIfNameUndefined = this.showMessageIfNameUndefined.bind(this);

        this.state = { page: 1 };
    }

    async componentDidMount() {
        const { default: phoneNumber } = await import('../../lib/phoneNumber.js');

        this.parsePhoneNumber = phoneNumber;
    }

    nextPage() {
        this.setState({ page: this.state.page + 1 });
    }

    previousPage() {
        this.setState({ page: this.state.page - 1 });
    }

    gotoPage(pageIndex) {
        this.setState({ page: pageIndex });
    }

    showMessageIfNameUndefined(e) {
        if (e[0] && e[0] === 'First Name cannot be set to undefined') {
            this.props.showMessageModal('Message', messages.errors.UNDEFINED_USRENAME);
        }
    }

    render() {
        /* const { onSubmit } = this.props;*/
        const submitMethod = this.props.loggedInFromFb ?
                             this.props.putUserData :
                             this.props.registerUser;

        /* TODO make sure this does not fail with differently
           structured responses from the server */
        const errorMessage = (es) =>
            (es && Array.isArray(es) && es.map(a => a.trim()).join(', ')) ||
            (es && typeof es === 'object' &&
                Object.keys(es).map(k => `${k}: ${es[k]}`).join(', ')) ||
            'Error in Sign up';

        const onSubmit = (data) => submitMethod(data, this.props.userId)
            .then(() => {
                if (!this.props.loggedInFromFb) {
                    this.props.showSignupSuccess();
                    return;
                }
                this.props.history.push('/');
            }).catch((e) => {
                this.showMessageIfNameUndefined(e);
                throw new SubmissionError({
                    _error: errorMessage(e)
                });
            });

        const { page } = this.state;
        const { sendCode, verifyCode, signupFormValues, isAlreadyVerified, loggedInFromFb } = this.props;

        const { userData } = this.props;

        const parsedNum = userData && this.parsePhoneNumber(userData.phone);

        const initialValues = userData && {
            email: userData.email && userData.email.search('@example.com') < 0 ?
                   userData.email : '',
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: parsedNum.num,
            countryCode: parsedNum.code,
            /* dob */
            day: userData.dateOfBirth.day,
            month: userData.dateOfBirth.month,
            year: userData.dateOfBirth.year,

            gender: userData.gender.toLowerCase()
        };

        const getPhoneNum = () => {
            const countryCode = signupFormValues.countryCode ? signupFormValues.countryCode : '+91';
            return `${countryCode}${signupFormValues.phone}`;
        };

        // Set this to true, ignore api calls for sms verification.
        const ignorePhoneVerification = false;
        const sendVerCode = (data) => {
            analytics.fbpTrack('Lead');

            if (ignorePhoneVerification) {
                this.nextPage();
                return null;
            }

            return sendCode(getPhoneNum()).then(() => {
                if (this.props.isAlreadyVerified) {
                    this.gotoPage(3);
                    return null;
                }
                this.nextPage();
            }).catch((e) => {
                throw new SubmissionError({
                    phone: errorMessage(e) || 'Seems to be some problem'
                });
            });
        };

        const resendCode = phone =>
            sendCode(phone).then(() => {
                if (this.props.isAlreadyVerified) {
                    this.nextPage();
                }
            }).catch((e) => {
                throw new SubmissionError({
                    verificationCode: errorMessage(e) || 'Seems to be some problem'
                });
            });

        const verify = (data) => {
            if (ignorePhoneVerification) {
                this.nextPage();
                return null;
            }

            return verifyCode(getPhoneNum(), data.verificationCode).then(() => {
                this.nextPage();
            }).catch((e) => {
                throw new SubmissionError({
                    verificationCode: errorMessage(e)
                });
            });
        };

        const formNames = [
            signupForms.PHONE,
            signupForms.VERIFY,
            signupForms.NAME,
            signupForms.DOB,
            signupForms.PASSWORD
        ];

        const stepEl = (
            <StepIndicator
              step={page}
              maxStep={formNames.length}
              gotoStep={this.gotoPage}
            />
        );

        const prevFormEl = (
            <div className="SignupManual__prevform__btn__container">
                <a
                  className="SignupManual__prevform__btn"
                  onClick={this.previousPage}
                >Go Back</a>
            </div>
        );

        const forms = {
            [signupForms.PHONE]: (
                <SignupPhoneAndEmail
                  initialValues={initialValues}
                  onSubmit={sendVerCode}
                  countryCode={signupFormValues.countryCode}
                  step={stepEl}
                  loggedInFromFb={loggedInFromFb}
                />
            ),
            [signupForms.VERIFY]: (
                <SignupVerifyPhone
                  nextPage={this.nextPage}
                  onSubmit={verify}
                  phone={getPhoneNum()}
                  resendCode={resendCode}
                  step={stepEl}
                  prevFormEl={prevFormEl}
                />
            ),
            [signupForms.NAME]: (
                <SignupFullName
                  initialValues={initialValues}
                  onSubmit={this.nextPage}
                  step={stepEl}
                  prevFormEl={prevFormEl}
                  loggedInFromFb={loggedInFromFb}
                />
            ),
            [signupForms.DOB]: (
                <SignupDOB
                  onSubmit={this.nextPage}
                  initialValues={initialValues}
                  step={stepEl}
                  prevFormEl={prevFormEl}
                  loggedInFromFb={loggedInFromFb}
                />
            ),
            [signupForms.ABOUT]: (
                <SignupUserAbout
                  onSubmit={this.nextPage}
                  name={signupFormValues.name}
                  step={stepEl}
                  prevFormEl={prevFormEl}
                />
            ),
            [signupForms.PASSWORD]: !loggedInFromFb ? (
                <SignupPassword
                  onSubmit={onSubmit}
                  step={stepEl}
                  prevFormEl={prevFormEl}
                  gotoPage={this.gotoPage}
                />
            ) : (
                <FbSignupLastStep
                  onSubmit={onSubmit}
                  step={stepEl}
                  prevFormEl={prevFormEl}
                  gotoPage={this.gotoPage}
                />
            )
        };

        const currentForm = forms[formNames[page - 1]];
        if (!currentForm && process.env.NODE_ENV !== 'production') {
            console.error('No form found for page', page - 1);
        }
        return forms[formNames[page - 1]];
    }
}

export default withRouter(SignupManual);
