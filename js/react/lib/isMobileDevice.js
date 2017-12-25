// http://stackoverflow.com/a/21742107
export default () => {
    if (process.env.ELT_IS_NOT_BROWSER === 'true') {
        return false;
    }

    const userAgent = navigator.userAgent || navigator.vendor || window.opera; // eslint-disable-line no-undef
    if (!(/android/i.test(userAgent) || (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream))) { // eslint-disable-line no-undef, max-len
        return false;
    }
    return true;
};
