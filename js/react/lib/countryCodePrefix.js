export default (cc) => {
    if (!cc || /^\+/.test(cc)) {
        return '';
    }
    return '+';
};
