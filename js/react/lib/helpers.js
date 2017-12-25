import moment from 'moment';

export const toInt = i => parseInt(i, 10);

export const toObj = arrArr => arrArr.reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {});

export const mapObj = (
    obj,
    {
        valFn = (x => x),
        keyFn = (x => x)
    }
) =>
    toObj(Object.entries(obj)
          .map(([k, v]) =>
               [keyFn(k, v), valFn(v, k)]));


export const isEmptyObject = obj => Object.keys(obj).length === 0 && obj.constructor === Object;

export const formatDate = (str => (str ? moment(str, 'YYYY-MM-DD') : null));
