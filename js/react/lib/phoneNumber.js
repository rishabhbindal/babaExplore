import PhoneNumber from 'google-libphonenumber';

export default (num) => {
    if (!num) {
        return {};
    }

    const phoneutils = PhoneNumber.PhoneNumberUtil.getInstance();
    const phoneData = phoneutils.parse(num);
    return {
        code: `+${phoneData.getCountryCode()}`,
        num: `${phoneData.getNationalNumber()}`
    };
};
