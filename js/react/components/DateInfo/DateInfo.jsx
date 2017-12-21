import React, { PropTypes } from 'react';
import moment from 'moment';

import './DateInfo.scss';

const DateInfo = ({ date }) => {
    const mdate = moment(date);
    const formatted = mdate.format('Do');
    const match = formatted.match(/(\d+)(st|nd|rd|th)/);

    const day = match[1];
    const daySuffix = match[2];

    return (
        <span>
            {day}<sup>{daySuffix}</sup> {mdate.format('MMMM')}
            <span className="DateInfo__year">, {mdate.format('YYYY')}</span>
        </span>
    );
};
DateInfo.propTypes = {
    date: PropTypes.string
};

export default DateInfo;
