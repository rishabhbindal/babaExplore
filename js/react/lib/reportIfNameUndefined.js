const reportIfNameUndefined = (data, signupMethod) => {
    if (!data.firstName || !data.lastName ||
      data.firstName === 'undefined' || data.lastName === 'undefined') {
        Raven.captureMessage('undefined-name-in-signup', { extra: { signupMethod, store: window.store.getState() } });
        Raven.context(() => { throw new Error('undefined-name-in-signup'); });
    }
};

export default reportIfNameUndefined;
