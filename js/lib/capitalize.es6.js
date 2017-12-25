export default str =>
    typeof str === 'string' ? str.replace(/(?:^|\s)\S/g, a => a.toUpperCase()) : '';
