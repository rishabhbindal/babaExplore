export default ({ src, id, onLoad = () => {}, onError = () => {} }) => {
    if (process.env.ELT_IS_NOT_BROWSER === 'true') {
        return;
    }

    const el = document.createElement('script');
    el.id = id;
    el.type = 'text/javascript';
    el.onerror = onError;
    el.onload = onLoad;

    const head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(el);
    el.src = src;
};
