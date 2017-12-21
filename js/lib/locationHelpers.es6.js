import capitalize from './capitalize.es6.js';

const name = searchCity => (searchCity.city || searchCity.state || '').toLowerCase();

export const cityCompare = (a, b) => {
    if (name(a) > name(b)) {
        return 1;
    }
    if (name(a) < name(b)) {
        return -1;
    }

    return 0;
};

export const capitalizeLoc = loc =>
    Object.assign({}, loc, {
        city: capitalize(loc.city),
        state: capitalize(loc.state)
    });

export const compareLoc = (a, b) =>
    cityCompare(a.city, b.city);
