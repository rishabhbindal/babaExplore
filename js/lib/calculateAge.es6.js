export default (birthday) => { // birthday is a date
    const dates = birthday.split('/');
    const d = new Date();
    const userday = dates[0];
    const usermonth = dates[1];
    const useryear = dates[2];
    const curday = d.getDate();
    const curmonth = d.getMonth() + 1;
    const curyear = d.getFullYear();
    const age = curyear - useryear;

    if ((curmonth < usermonth) || ((curmonth === usermonth) && curday < userday)) {
        return age - 1;
    }

    return age;
};
