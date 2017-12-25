export const setSession = ({ email }) =>
    window.mixpanel && window.mixpanel.register({ email });

export const track = (title, param) =>
    window.mixpanel && window.mixpanel.track(title, param);

export const captureException = (e, context) =>
    window && window.Raven && window.Raven.captureException(e, {
        extra: context
    });
