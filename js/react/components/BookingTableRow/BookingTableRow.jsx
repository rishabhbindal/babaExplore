import React, { PropTypes } from 'react';
import cls from 'classnames';

import './BookingTableRow.scss';

const BookingTableRow = ({ left, right, whole, withBottomBorder }) => {
    if (whole) {
        return (
            <tr className={cls(withBottomBorder && 'booking-table-tr--bottom-border')}>
                <td className="booking-table-td booking-table-td--whole" colSpan="2">
                    {whole}
                </td>
            </tr>
        );
    }

    return (
        <tr className={cls(withBottomBorder && 'booking-table-tr--bottom-border')}>
            <td className="booking-table-td booking-table-td--left">
                {left}
            </td>
            <td className="booking-table-td booking-table-td--right">
                {right}
            </td>
        </tr>
    );
};

const tdEntryType = PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.node])

BookingTableRow.propTypes = {
    left: tdEntryType,
    right: tdEntryType,
    whole: tdEntryType,
    withBottomBorder: PropTypes.bool
};

export default BookingTableRow;
