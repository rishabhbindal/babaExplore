
const { serverPath } = require('../utils/e2e/config.js');

const GATEWAY_FEES_PERC = 2.1;
const EXPLORE_FEES = {
    '3f35ce13-bcdf-4425-81bc-c57f135ffe45': {
        type: 'percent',
        amount: 30
    }
};

let totalStayInDays = 0;
let packageType = 'room'; // `2` does not have check-out dates
const propsToKeepInTotals = {
    room: ['Total', 'Payment gateway fees', 'Total nights selected', 'Price for 1 night'],
    'day lounge': ['Total', 'Payment gateway fees']
};


// Few listings -
// 'active'
// '3f35ce13-bcdf-4425-81bc-c57f135ffe45'
// 'f4007d6a-881b-4065-8013-6759248a4420'
// '52fe13df-cb2e-4a44-82c5-50a8ae24b513'

// change this (below) to test different listings
const TARGET_LISTING = '52fe13df-cb2e-4a44-82c5-50a8ae24b513';
const TARGET_LISTING_URL = `http://${serverPath}/listing/${TARGET_LISTING}`;

const EC = protractor.ExpectedConditions;

let bookables = [];
let totals = {};
const dates = {
    checkInElem: element(by.model('requestedListingData.date_from')),
    checkOutElem: element(by.model('requestedListingData.date_until')),
    checkInDate: '',
    checkOutDate: ''
};

const randomNumber = max => Math.round(Math.random() * max);

const getPrice = (priceStr) => {
    if (!priceStr) {
        return priceStr;
    }
    return priceStr[0] === '₹' ?
        parseInt(priceStr.slice(1).replace(',', ''), 10) :
        parseInt(priceStr.replace(',', ''), 10);
};

const processRow = (fn) => (row) => {
    return row.all(by.css('td')).then((cells) => {
        const propItem = {};
        fn(cells, propItem);
        return propItem;
    });
};


const processPropertyTableRow = (cells, propItem) => {
    // selector / checkbox
    propItem.selectorCell = cells[0];
    propItem.selector = cells[0].element(by.tagName('select'));
    propItem.selector.isPresent().then((present) => {
        propItem.selectorPresent = present;
    });

    // item kind (room, guest, etc)
    cells[1].getText().then((kind) => {
        propItem.kind = kind.split('\n')[0];
    });

    // price
    cells[2].getText().then((txt) => {
        propItem.price = getPrice(txt);
    });
    return propItem;
};


const getBookingRows = (bookables) =>
    Promise.all(bookables.map(processRow(processPropertyTableRow)));


const setBookingRows = () => {
    return element.all(by.css('.bookables table tbody tr')).then((bookables) => {
        return getBookingRows(bookables);
    }).then((data) => {
        bookables = data;
    });
};


const selectRandomProperties = () => {
    // bookableProperties
    const total = {};
    total.total = 0;
    bookables.forEach((bookable, index) => {
        const { selector, selectorPresent, kind, price } = bookable;
        // For now, skip Additional Guests field.
        if (!(kind.toLowerCase().search('additional guest') > -1)) {
            if (selectorPresent) {
                selector.click();
                selector.all(by.tagName('option')).then((options) => {
                    const randomOption = randomNumber(options.length - 1);
                    options[randomOption].click();
                    total.total += (price * randomOption);
                });
            } else {
                // not a selector but a checkbox. maybe check it.
                if (randomNumber(1)) {
                    bookable.selectorCell
                        .element(by.css('input[type="checkbox"]')).click();
                    total.total += price;
                }
            }
        }
    });
    return total;
};


const processTotalsRow = (cells, propItem) => {
    let key = '';
    cells.forEach((cell, index) => {
        cell.getText().then((txt) => {
            if (index === 0) {
                key = String(txt).split('\n')[0];
            } else {
                propItem[key] = txt;
            }
        });
    });
    return propItem;
};

const getTotalsRows = totals => Promise.all(totals.map(processRow(processTotalsRow)));
const objectListToObject = (objs) =>
    objs.reduce((acc, each) => {
        Object.keys(each).forEach((key) => {
            acc[key] = each[key];
        });
        return acc;
    }, {});

const setTotals = () => {
    element.all(by.css('fieldset.totals table tbody tr')).then(totals => {
        return getTotalsRows(totals);
    }).then((data) => {
        totals = objectListToObject(data);
    });
};

const selectDate = (whichCal, whichDay) => {
    return $$('.datepicker-days')
        .get(whichCal)
        .$$('td:not(.disabled):not(.new)')
        .then((activeDays) => {
            activeDays && activeDays[whichDay].click();
        });
};

const saveSetDates = () => {
    // Read the selected dates from the page
    dates.checkInElem.getAttribute('value').then((checkInDate) => {
        dates.checkInDate = checkInDate;
    });

    if (packageType === 'room') {
        dates.checkOutElem.getAttribute('value').then((checkOutDate) => {
            dates.checkOutDate = checkOutDate;
        });
    }
};

const setCalendar = (daysDifference) => {
    dates.checkInElem.click();
    selectDate(0, 0).then(() => {
        $$('.datepicker-days').get(1).isDisplayed().then((exists) => {
            if (!exists) {
                totalStayInDays = 1;
                packageType = 'day lounge';
                return null;
            }
            saveSetDates();
            browser.wait(EC.visibilityOf($$('.datepicker-days').get(1)), 5000);
            return selectDate(1, daysDifference - 1);
        });
    });
};

const getDateString = (date) => {
    let dd = date.getDate();
    let mm = date.getMonth() + 1; // Jan is 0
    const yyyy = date.getFullYear();

    if (dd < 10) {
        dd = `0${dd}`;
    }
    if (mm < 10) {
        mm = `0${mm}`;
    }

    return `${dd}/${mm}/${yyyy}`;
};

const getCheckinCheckoutDates = (difference) => {
    const today = new Date();
    return {
        checkin: getDateString(today),
        checkout: getDateString(new Date(today.setDate(today.getDate() + difference)))
    };
};

const getExploreFee = (total) => {
    if (TARGET_LISTING in EXPLORE_FEES) {
        const fees = EXPLORE_FEES[TARGET_LISTING];
        if (fees.type === 'percent') {
            return total + ((total * fees.amount) / 100);
        }
        return total + fees.amount;
    }
    return total;
};

const stripProps = (obj) => {
    const keepProps = propsToKeepInTotals[packageType];
    const keys = Object.keys(obj).filter(key => keepProps.includes(key));
    return keys.reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
    }, {});
};

// attempts to parse all values (assumes string) to integer.
const changeValsToPrice = (obj) =>
    Object.keys(obj).reduce((acc, key) => {
        acc[key] = getPrice(obj[key]);
        return acc;
    }, {});


const getExpectedTotals = (totalDays, perDayPrice, serviceCharge) => {
    let total = totalDays * perDayPrice;
    total = getExploreFee(total);
    const charge = Math.round(parseFloat((total * (serviceCharge / 100)).toFixed(2)));
    const totals = {
        'Price for 1 night': perDayPrice,
        'Total nights selected': totalDays,
        'Payment gateway fees': charge,
        // 'Coupon code (add)': '',
        // 'Down Payment': '',
        Total: total + charge
    };
    return stripProps(totals);
};

const cleanupTotals = (totals) => changeValsToPrice(stripProps(totals));

describe('Test for dates and totals', () => {
    browser.get(TARGET_LISTING_URL);

    let pricePerDay = 0;
    setBookingRows().then(selectRandomProperties).then((total) => {
        pricePerDay = total.total;
    });

    // set expected dates
    totalStayInDays = randomNumber(5);
    const { checkin, checkout } = getCheckinCheckoutDates(totalStayInDays);

    // set calendar on the page
    setCalendar(totalStayInDays);

    // read totals from the page
    setTotals();

    it('checkin-checkout dates', () => {
        // check if dates are selected properly
        expect(dates.checkInElem.getAttribute('value')).toBe(checkin);
        if (packageType === 'room') { // because day lounge does not have checkout
            expect(dates.checkOutElem.getAttribute('value')).toBe(checkout);
        }
    });

    it('totals calculation', () => {
        // check if the totals are calculated as expected
        const expectedTotals = getExpectedTotals(totalStayInDays, pricePerDay, GATEWAY_FEES_PERC);
        expect(cleanupTotals(totals)).toEqual(expectedTotals);
    });
});
