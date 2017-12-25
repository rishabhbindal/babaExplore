const warn = (...args) => {
    console && console.warn(...args);
};

const pageView = (opts) => {
    const { host, pathname, hash } = window.location;
    const params = Object.assign({ page: `${host}${pathname}${hash}` }, opts);
    window.ga('send', 'pageview', params);
};

const event = (opts) => {
    const eventObj = Object.assign({}, opts, {
        hitType: 'event'
    });
    if (window.ga) {
        window.ga('send', eventObj);
    }
};

const request = eventAction => ({
    start: opts => event(Object.assign({ eventAction, eventCategory: 'Request' }, opts)),
    success: opts => event(Object.assign({ eventAction, eventCategory: 'Success' }, opts)),
    failure: opts => event(Object.assign({ eventAction, eventCategory: 'Failure' }, opts))
});

/*
 * Login started —> Lead
 * Login completed —> CompleteRegistration
 * Check availability —> AddToCart
 * Booking completed —> Purchase
 */
const fbpTrack = (title, param) => {
    const events = ['Lead', 'CompleteRegistration', 'AddToCart', 'Purchase', 'PageView'];
    if (events.indexOf(title) === -1) {
        warn(`Event '${title}' is not in supported list.`);
    }

    if (process.env.NODE_ENV === 'production') {
        if (!window || !window.fbq) {
            warn('Facebook pixel not available');
            return;
        }
        const fbq = window.fbq;

        try {
            fbq('track', title, param);
        } catch (e) {
            warn('Facebook pixel  failed', e);
        }
    }
};

export default {
    fbpTrack,
    pageView,
    event,
    request
};
