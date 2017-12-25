/**
 * Assumes that all urls end with a '/'. Django seems to be configured
 * that way. Be careful about using it with urls, which have id at the
 * end.
 */
export default url => url.split('/').slice(-2)[0];
