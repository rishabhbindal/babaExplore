/**
 * @see https://mathiasbynens.be/notes/localstorage-pattern
 */
const hasStorage = (() => {
    try {
        window.localStorage.setItem('test', 'test');
        window.localStorage.removeItem('test');
        return true;
    } catch (exception) {
        return false;
    }
})();

const getTokenFromLocalStorage = () => hasStorage ? window.localStorage.userKey : null;
const getTokenFromCookie = () =>
    document.cookie.replace(/(?:(?:^|.*;\s*)userKey\s*\=\s*([^;]*).*$)|^.*$/, '$1');

export const getUserSessionToken = () => {
    if (process.env.ELT_IS_NOT_BROWSER === 'true') {
        return null;
    }

    const lToken = getTokenFromLocalStorage();

    if (lToken) {
        return lToken;
    }

    return getTokenFromCookie();
};

export const updateCookie = () => {
    const now = new Date().toUTCString();
    document.cookie.split(';').forEach((c) => {
        document.cookie = c
            .replace(/^ +/, '').replace(/\=.*/, `=;expires=${now};path=/`);
    });
};

const deleteCookie = (name) => {
    document.cookie = `${name}=deleted; expires=${new Date(0).toUTCString()}`;
};

const deleteCookies = () => {
    ['isLogin', 'userKey'].map(deleteCookie);
};

export const setUserSessionToken = (userKey) => {
    updateCookie();
    if (hasStorage) {
        window.localStorage.userKey = userKey;
        window.localStorage.isLogin = '1';
        return;
    }

    document.cookie = `userKey=${userKey}`;
    document.cookie = 'isLogin=1';
};

export const deleteUserBrowserSession = () => {
    window.localStorage.clear();
    deleteCookies();
};
