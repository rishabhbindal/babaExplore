export default (obj, keys, { omitFalse } = {}) => {
    const retObj = {};
    keys.forEach((key) => {
        if (omitFalse && !obj[key]) {
            return;
        }

        retObj[key] = obj[key];
    });

    return retObj;
};
