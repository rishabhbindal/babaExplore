export default (es, defaultMsg = 'There was some error in fullfilling the request.') =>
    (es && Array.isArray(es) && es.map(a => a.trim()).join(', ')) ||
    (es && typeof es === 'object' && !es.details &&
        Object.keys(es).map(k => `${k}: ${es[k]}`).join(', ')) ||
    (es && typeof es === 'object' && es.details &&
        Object.keys(es.details).map(k => `'${k}': ${es.details[k]}`).join(', ')) ||
    defaultMsg;
