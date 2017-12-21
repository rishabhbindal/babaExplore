import { bookableTypes, orderStates } from '../constants/enumConstants.js';

const buttonTexts = {
    [`${bookableTypes.VIDEO}-${orderStates.INITIAL_STATE}`]: 'Request for video',
    [`${bookableTypes.VIDEO}-${orderStates.NOTIFICATION_SENT}`]: 'Request has been sent',
    [`${bookableTypes.VIDEO}-${orderStates.ACCEPTED}`]: 'Check Email',
    [`${bookableTypes.VIDEO}-${orderStates.HOST_REJECTED}`]: 'Not Accepted',
    [`${bookableTypes.ROOM}-${orderStates.ACCEPTED}`]: 'Pay Now',
    [`${bookableTypes.ROOM}-${orderStates.INITIAL_STATE}`]: 'Check Availability',
    [`${bookableTypes.ROOM}-${orderStates.NOTIFICATION_SENT}`]: 'Notification Sent',
    [`${bookableTypes.ROOM}-${orderStates.PAYMENT_PENDING}`]: 'Pay Now',
    [`${bookableTypes.ROOM}-${orderStates.PAYMENT_CONFIRMED}`]: 'Booking Complete',
    [`${bookableTypes.ROOM}-${orderStates.HOST_REJECTED}`]: 'Not Accepted',
    [`${bookableTypes.PACKAGE}-${orderStates.INITIAL_STATE}-insta`]: 'Book Now',
    [`${bookableTypes.PACKAGE}-${orderStates.INITIAL_STATE}`]: 'Apply for Free',
    [`${bookableTypes.PACKAGE}-${orderStates.NOTIFICATION_SENT}`]: 'Notification Sent',
    [`${bookableTypes.PACKAGE}-${orderStates.PAYMENT_PENDING}`]: 'Pay Now',
    [`${bookableTypes.PACKAGE}-${orderStates.PAYMENT_CONFIRMED}`]: 'Booking Complete',
    [`${bookableTypes.PACKAGE}-${orderStates.ACCEPTED}`]: 'Pay Now',
    [`${bookableTypes.PACKAGE}-${orderStates.HOST_REJECTED}`]: 'Not Accepted'
};

export default (bookableTypeList, state, insta, bookingFull) => {
    if (bookingFull) {
        return 'Booking Full';
    }

    const bookableType = (bookableTypeList && bookableTypeList[0]) || bookableTypes.ROOM;
    const key = `${bookableType}-${state || orderStates.INITIAL_STATE}`;
    const instaTxt = buttonTexts[`${key}${insta ? '-insta' : ''}`];
    return instaTxt || buttonTexts[key];
};
