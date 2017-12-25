export const registerPhoneTransform = res => ({
    verificationId: res && res.url.split('/').slice(-1)[0]
});
