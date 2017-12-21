import eltFeeTypes from '../constants/feeTypes.js';

export const exploreFeesCalc = {
    [eltFeeTypes.DISABLE]: x => x,
    [eltFeeTypes.AMOUNT]: (total, days, eltFee, ticketCount) =>
        total
};

export const eventBooking = ({
    ticketPrice,
    ticketCount,
    eltFeeCalculationMethod
}) => {
    return {
        totalPrice: ticketPrice * ticketCount
    };
};
