
const isDebugState = () => window && window.debug;

export const log = (...args) => isDebugState() && console && console.log(...args);
export const info = (...args) => isDebugState() && console && console.info(...args);

export const wrap = (arg) => {
    log(arg);
    return arg;
};

log.log = log;
log.info = info;
log.wrap = wrap;

export default log;
