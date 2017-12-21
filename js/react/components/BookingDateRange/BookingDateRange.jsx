import moment from 'moment';
import cls from 'classnames';
import React, { PropTypes } from 'react';

import './BookingDateRange.scss';

const BookingDateRange = ({ checkIn, checkOut, alignLeft }) => {
    const start = moment(checkIn);
    const end = moment(checkOut);

    const sameYear = start.year() === end.year();
    const sameMonth = sameYear && start.month() === end.month();

    let commonFmt = '';
    let dateFmt = 'DD MMM, YYYY';
    if (sameMonth) {
        commonFmt = ' <b>MMM</b>, YYYY';
        dateFmt = 'DD';
    } else if (sameYear) {
        commonFmt = ', YYYY';
        dateFmt = 'DD MMM';
    }

    return (
        <span className={cls({ 'booking-date-range': !alignLeft })}>
            <span className="b"> {start.format(dateFmt)} </span>
            -
            <span className="b"> {end.format(dateFmt)} </span>
            <span dangerouslySetInnerHTML={{ __html: start.format(commonFmt) }} />
        </span>
    );
};

BookingDateRange.propTypes = {
    checkIn: PropTypes.string,
    checkOut: PropTypes.string,
    alignLeft: PropTypes.bool
};

export default BookingDateRange;
