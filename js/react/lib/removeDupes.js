const addCount = (elem, arr) => arr.reduce((c, i) => elem.url === i.url ? ++c : c, 0);

export default (arr) => {
    const uniques = arr.filter((elem, pos) => arr.findIndex(i => i.url === elem.url) === pos);
    return uniques.map((elem) => {
        elem.instances = addCount(elem, arr);
        return elem;
    });
};
