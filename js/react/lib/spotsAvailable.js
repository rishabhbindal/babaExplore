export default (property) => {
    const availableSpots = property.bookables[0].availableInstances;
    if (typeof availableSpots !== 'undefined' && !availableSpots) {
        return false;
    }
    return true;
};
