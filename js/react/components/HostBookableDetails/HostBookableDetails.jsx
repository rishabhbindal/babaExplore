import React, { PropTypes } from 'react';
import './HostBookableDetails.scss';

const HostBookableDetails = ({ date, quantityMap, bill, id }) => {
    const checkIn = date.from;
    const checkOut = date.until;
    const dayDifference = Math.round((checkOut - checkIn) / (1000 * 60 * 60 * 24));

    const HostBookableItem = ({ label, value, isLabel }) => (
        <tr className="HostBookableDetails-row">
            <td>
                { isLabel && <label htmlFor={label} className="HostBookableDetails-label">{ label }</label> }
                { !isLabel && <span className="HostBookableDetails-label">{ label }</span> }
            </td>
            <td style={{ textAlign: 'right' }}>
                { isLabel && <label htmlFor={label} className="HostBookableDetails-label">{ value }</label> }
                { !isLabel && <span className="HostBookableDetails-label">{ value }</span> }
            </td>
        </tr>
    );

    const HostBookableItemBreak = ({ colspan }) => (
        <tr className="HostBookableDetails-row">
            <td colSpan={colspan || 2}>
                <hr className="HostBookableDetails-row__hr" />
            </td>
        </tr>
    );

    const getAmount = (amount) => {
        if (amount) {
            return Object.values(amount)[0];
        }
        return 0;
    }
    const payout = bill.amount - bill.fee - bill.exploreFee;

    return (
        <div>
            <table className="HostBookableDetails medium-12 small-12">
                <tr className="HostBookableDetails-row">
                    <td>
                        <label htmlFor="Check In"className="HostBookableDetails-label">Check In</label>
                        <label htmlFor="Check In" className="HostBookableDetails-label">
                            { checkIn.format('DD MMM, YYYY') }
                        </label>
                    </td>
                    <td>

                        <label htmlFor="Check Out" className="HostBookableDetails-label">Check Out</label>
                        <label htmlFor="Check Out" className="HostBookableDetails-label">
                            { checkOut.format('DD MMM, YYYY') }
                        </label>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                        <label htmlFor="Days" className="HostBookableDetails-label">Days</label>
                        <label htmlFor="No of Days" className="HostBookableDetails-label">{ dayDifference }</label>
                    </td>
                </tr>
                <HostBookableItemBreak colspan="3" />
            </table>
            <table className="HostBookableDetails medium-12 small-12">
                <HostBookableItem label="Booking For" value="Quantity" />
                {
                    Object.values(quantityMap).map(({ caption, requested, amount }, id) => (
                        <HostBookableItem
                          label={`${caption} ( Rs.${getAmount(amount)} )`}
                          value={requested}
                          isLabel
                          key={id}
                        />
                    ))
                }
                <HostBookableItemBreak />
            </table>
            <table className="HostBookableDetails medium-12 small-12">
                <HostBookableItem label="Payout" value={`Rs. ${payout}`} />
                <HostBookableItemBreak />
                <HostBookableItem label="Order Id" value={`ELTORDER_${id}`} />
                <HostBookableItemBreak />
            </table>
        </div>
    );
};

HostBookableDetails.propTypes = {
    date: PropTypes.object,
    quantityMap: PropTypes.object,
    bill: PropTypes.object,
    id: PropTypes.string
};

export default HostBookableDetails;
