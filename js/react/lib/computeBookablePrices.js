import { chargeType } from '../constants/enumConstants.js';

export const calculateCharge = ({ charge: { type, amount }, price, itemCount }) => {
    switch (type) {
    case chargeType.AMOUNT:
        return amount * itemCount;
    case chargeType.PERCENT:
        return Math.round((price * amount) / 100);
    case chargeType.DISABLED:
    default:
        return 0;
    }
};

/**
 * Payment calculation for a bookable.
 *
 * For each bookable:
 * calculate amount * quantity_requested + guests * guestCharge
 *
 * TODO: surge calculation!
 */
export const bookablePrice = ({ bookable, surge = {}, requested, guestCount, days = 1 }) => {
    const pricing = bookable.pricing;
    const itemCount = requested * days;

    const price = (pricing.ticketPrice * itemCount) + (pricing.guestCharge * guestCount * days);

    /**
     * NOTE: Clarify why downpayment is set to price, when <= 0.
     */
    let downPayment = calculateCharge({ charge: bookable.downPayment, price, itemCount });
    if (downPayment <= 0 || downPayment > price) {
        downPayment = price;
    }

    let exploreFee = calculateCharge({ charge: bookable.exploreFee, price, itemCount });
    if (exploreFee < 0) {
        exploreFee = 0;
    }

    return {
        price,
        downPayment,
        exploreFee
    };
};


const sum = arr => arr.reduce((a, b) => a + b, 0);

export const bookablesTotal = ({ bookables, surges = {}, requests, days = 1 }) => {
    const getRequested = (bookable) => {
        if (!bookable || bookable.requested === false) {
            return 0;
        }

        return bookable.requested || 1;
    };

    const getGuestCount = (request) => {
        if (!request) {
            return 0;
        }
        return request.extraGuests || 0;
    };

    const prices = bookables.map(bookable => bookablePrice({
        bookable,
        surge: {},
        requested: getRequested(requests[bookable.id]),
        guestCount: getGuestCount(requests[bookable.id]),
        days
    }));

    return {
        cost: sum(prices.map(p => p.price)),
        downPayment: sum(prices.map(p => p.downPayment)),
        exploreFee: sum(prices.map(p => p.exploreFee))
    };
};

export const gatewayFee = (c, gatewayCharge) => Math.round((c * gatewayCharge) / 100);

export const bookablesBill = ({ bookables, surges = {}, requests, days = 1, gatewayCharge, coupon }) => {
    const { cost, downPayment, exploreFee } = bookablesTotal({ bookables, surges, requests, days });

    let discount = coupon ? calculateCharge({
        charge: { amount: coupon.value, type: coupon.type },
        price: cost,
        itemCount: 1
    }) : 0;
    if (discount > cost) {
        discount = cost;
    }

    const discountedCost = cost - discount;
    const gatewayFees = gatewayFee(discountedCost, gatewayCharge);
    const downPaymentGatewayFee = gatewayFee(downPayment, gatewayCharge);

    return {
        bill: {
            cost,
            gatewayFee: gatewayFees,
            exploreFee,
            discount,
            discountedCost,
            total: discountedCost + gatewayFees // ignore explorefee here
        },
        downPayment: {
            cost: downPayment,
            gatewayFee: downPaymentGatewayFee,
            exploreFee,
            total: downPayment + downPaymentGatewayFee // ignore explorefee
        }
    };
};

const discountForCustomPrice = (cost, coupon) => {
    if (!coupon) {
        return 0;
    }
    const discount = calculateCharge({
        charge: { amount: coupon.value, type: coupon.type },
        price: cost,
        itemCount: 1
    });
    return (discount < cost) ? discount : cost;
};

export const customPriceTotal = ({ customPrice, totals, coupon, gatewayCharge, percentFee }) => {
    const { cost, downpaymentCost } = customPrice;
    let exploreFee = totals.bill.exploreFee;
    if (percentFee.enabled) {
        exploreFee = calculateCharge({
            charge: { type: chargeType.PERCENT, amount: percentFee.val },
            price: cost,
            itemCount: 1
        });
    }
    const discount = discountForCustomPrice(cost + exploreFee, coupon);
    const discountedCost = (cost + exploreFee) - discount;
    const gatewayFees = gatewayFee((discountedCost), gatewayCharge);
    const downPaymentGatewayFee = gatewayFee((downpaymentCost), gatewayCharge);
    return {
        bill: {
            cost: cost + exploreFee,
            gatewayFee: gatewayFees,
            discount,
            discountedCost,
            exploreFee,
            total: discountedCost + gatewayFees
        },
        downPayment: {
            cost: downpaymentCost,
            gatewayFee: downPaymentGatewayFee,
            exploreFee,
            total: downpaymentCost + downPaymentGatewayFee
        }
    };
};

// export const
