import isEmail from 'sane-email-validation';
import phone from 'phone';

import messages from '../constants/messages.js';
import countryCodePrefix from '../lib/countryCodePrefix.js';

const errorMsgs = messages.errors;

// const PHONE_REGEXP = /^[(]{0,1}[0-9]{3}[)\.\- ]{0,1}[0-9]{3}[\.\- ]{0,1}[0-9]{4}$/;

/**
 * @see https://github.com/erikras/react-redux-universal-hot-example/blob/master/src/utils/validation.js
 */
const isEmpty = value => value === undefined || value === null || value === '';
const toInt = i => parseInt(i, 10);

const join = (rules, props) => (value, data) => {
    const errors = rules
        .map(rule => rule(value, data, props))
        .filter(error => !!error);
    return errors.length && errors[0];
};

export const emailValidation = (value) => {
    if (isEmpty(value)) {
        return errorMsgs.FILL_EMAIL;
    }

    if (!isEmail(value)) {
        return errorMsgs.INVALID_EMAIL;
    }

    return null;
};

export const confirmEmailValidation = (value, formValues, props) => {
    if (!value) {
        return errorMsgs.FILL_EMAIL;
    }
    if (value !== props.inputEmail.trim()) {
        return errorMsgs.EMAIL_MISMATCH;
    }
    if (!isEmail(value)) {
        return errorMsgs.INVALID_EMAIL;
    }
    return null;
};

export const phoneValidation = (value, props) => {
    if (isEmpty(value)) {
        return errorMsgs.INVALID_PHONE;
    }

    const code = props.countryCode || '+91';
    const prefix = countryCodePrefix(code);
    const normalized = phone(`${prefix}${code}${value}`);
    if (normalized.length === 0) {
        return errorMsgs.INVALID_PHONE;
    }

    return null;
};

export const passwordValidation = (value, data) => {
    const firstFieldValue = data.password;
    const secondFieldValue = value;

    if (!firstFieldValue && !secondFieldValue) {
        return errorMsgs.CHOOSE_PASSWORD;
    }

    if (!firstFieldValue || !secondFieldValue) {
        return errorMsgs.RETYPE_PASSWORD;
    }

    if (firstFieldValue !== secondFieldValue) {
        return errorMsgs.PASSWORDS_DONT_MATCH;
    }

    return null;
};

export const dayValidation = (day) => {
    if (!day) {
        return errorMsgs.FILL_DOB_DAY;
    }

    const dayStr = `${toInt(day)}`;
    if (day && !dayStr.match(/^([1-9]|[12][0-9]|3[01)])$/)) {
        return errorMsgs.FILL_DOB_VALID_DAY;
    }
    return null;
};

export const monthValidation = (month) => {
    if (!month) {
        return errorMsgs.FILL_DOB_MONTH;
    }

    const monthStr = `${toInt(month)}`;
    if (monthStr && !monthStr.match(/^([1-9]|[12][0-9]|3[01)])$/)) {
        return errorMsgs.FILL_DOB_VALID_MONTH;
    }
    return null;
};

const getAge = (birthDate) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1;
    }
    return age;
};

export const yearValidation = (value, data) => {
    const { day, month, year } = data;

    const dob = new Date(toInt(year), toInt(month), toInt(day));
    const age = getAge(dob);

    if (!year) {
        return errorMsgs.FILL_YEAR;
    }

    if (year && !year.match(/^((19|20)\d\d)$/)) {
        return errorMsgs.YEAR_INVALID;
    }

    if (age < 18) {
        return errorMsgs.LESS_THAN_18;
    }

    return null;
};

export const termsValidation = (value) => {
    if (!value) {
        return `Select the terms checkbox to continue registeration.
Please go through terms, and get in touch with us if you have any questions.`;
    }

    return null;
};

export const genderValidation = (value) => {
    if (!value) {
        return 'Choose your gender.';
    }
    return null;
};

export const nameValidation = (value) => {
    if (!value || value === 'undefined') {
        return 'Required';
    }
    return null;
};

export const textValidation = (value) => {
    if (!value || !value.trim()) {
        return 'Required';
    }
    return null;
};

export const placeValidation = (value) => {
    if (!value || !/\d/.test(value)) {
        return null;
    }
    return 'Please do not enter numbers in place name';
};

export const createValidator = rules => (data = {}, props) =>
    Object.keys(rules).reduce((errors, key) => {
        const rule = join([].concat(rules[key]), props); // concat enables both functions and arrays of functions
        const error = rule(data[key], data);
        return Object.assign({}, errors, { [key]: error });
    }, {});


export const extraInfoValidator = (extraInfo, props) => {
    const errors = {};

    if (props.userData && props.userData.profilePic.indexOf('default-user') !== -1 && !extraInfo.picture) {
        errors.picture = 'Please select a profile picture.';
    }

    if (!extraInfo.about) {
        errors.about = 'Please enter a short description for yourself';
    }

    if (!extraInfo.age || extraInfo.age < 18) {
        errors.age = errorMsgs.INVALID_AGE;
    }

    if (props.userData) {
        errors.phone = phoneValidation(extraInfo.phone, extraInfo);
    }

    if (!extraInfo.firstName) {
        errors.firstName = 'Required';
    }

    if (!extraInfo.lastName) {
        errors.lastName = 'Required';
    }

    if (!extraInfo.email || extraInfo.email.indexOf('example.com') !== -1) {
        errors.email = 'Valid Email Required';
    }

    return errors;
};

export const pictureValidation = (pic, formValues, props) => {
    const { userData } = props;
    if (!pic && !(userData && userData.profilePic)) {
        return errorMsgs.INVALID_PICTURE;
    }
    return null;
};

export const ageValidation = (age) => {
    if (!age || age < 18) {
        return errorMsgs.INVALID_AGE;
    }
    return null;
};
