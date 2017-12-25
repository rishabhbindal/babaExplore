/**
 * @see https://stackoverflow.com/questions/5454235/javascript-shorten-string-without-cutting-words
 */
export default (txt, chars = 100) => {
    if (txt.length <= chars) {
        return txt;
    }
    // trim the string to the maximum length
    const trimmed = `${txt} `.substr(0, chars);

    // re-trim if we are in the middle of a word
    return `${trimmed.substr(0, Math.min(trimmed.length, trimmed.lastIndexOf(' ')))} \u2026`;
};
