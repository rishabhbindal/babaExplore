export const types = {
    TOGGLE_BOOKABLE_USER_MODAL_VISIBILITY: 'TOGGLE_BOOKABLE_USER_MODAL_VISIBILITY',
    SHOW_MESSAGE_MODAL: 'SHOW_MESSAGE_MODAL',
    HIDE_MESSAGE_MODAL: 'HIDE_MESSAGE_MODAL',
    SHOW_BOOKING_SUCCESS_MODAL: 'SHOW_BOOKING_SUCCESS_MODAL',
    HIDE_BOOKING_SUCCESS_MODAL: 'HIDE_BOOKING_SUCCESS_MODAL',
    SHOW_SIGNUP_SUCCESS_MODAL: 'SHOW_SIGNUP_SUCCESS_MODAL',
    HIDE_SIGNUP_SUCCESS_MODAL: 'HIDE_SIGNUP_SUCCESS_MODAL',
    SHOW_ORDER_USER_ASK_MESSAGE: 'MODALS/SHOW_USER_ASK_MESSAGE',
    HIDE_ORDER_USER_ASK_MESSAGE: 'MODALS/HIDE_USER_ASK_MESSAGE',
    SHOW_FORGOT_PASSWORD_MODAL: 'SHOW_FORGOT_PASSWORD_MODAL',
    HIDE_FORGOT_PASSWORD_MODAL: 'HIDE_FORGOT_PASSWORD_MODAL',
    SHOW_JOIN_COMMUNITIES_MODAL: 'SHOW_JOIN_COMMUNITIES_MODAL',
    HIDE_JOIN_COMMUNITIES_MODAL: 'HIDE_JOIN_COMMUNITIES_MODAL',
    SHOULD_SHOW_MISSING_DETAILS_MODAL: 'SHOULD_SHOW_MISSING_DETAILS_MODAL',
    SHOW_PAYMENT_SELECTOR: 'SHOW_PAYMENT_SELECTOR'
};

const reducer = (state = { bookableModal: false }, { type, payload }) => {
    switch (type) {
    case types.TOGGLE_BOOKABLE_USER_MODAL_VISIBILITY:
        return { ...state, bookableModal: payload ? payload.visible : !state };
    case types.SHOW_MESSAGE_MODAL:
        return { ...state, modal: { title: payload.title, content: payload.content } };
    case types.HIDE_MESSAGE_MODAL:
        return { ...state, modal: null };
    case types.SHOW_BOOKING_SUCCESS_MODAL:
        return { ...state, bookingModal: true, bookingOrderId: payload.orderId };
    case types.HIDE_BOOKING_SUCCESS_MODAL:
        return { ...state, bookingModal: false, bookingOrderId: null };
    case types.SHOW_SIGNUP_SUCCESS_MODAL:
        return { ...state, signupModal: true };
    case types.HIDE_SIGNUP_SUCCESS_MODAL:
        return { ...state, signupModal: false };
    case types.SHOW_ORDER_USER_ASK_MESSAGE:
        return { ...state, orderAskUserMessage: true, showOrderChangeMessage: payload && payload.showOrderChangeMessage };
    case types.HIDE_ORDER_USER_ASK_MESSAGE:
        return { ...state, orderAskUserMessage: false };
    case types.SHOW_FORGOT_PASSWORD_MODAL:
        return { ...state, hostOrderModal: true };
    case types.HIDE_FORGOT_PASSWORD_MODAL:
        return { ...state, hostOrderModal: false };
    case types.SHOW_JOIN_COMMUNITIES_MODAL:
        return { ...state, joinCommunitiesModal: true };
    case types.HIDE_JOIN_COMMUNITIES_MODAL:
        return { ...state, joinCommunitiesModal: false };
    case types.SHOULD_SHOW_MISSING_DETAILS_MODAL:
        return { ...state, missingDetailsModal: payload };
    case types.SHOW_PAYMENT_SELECTOR:
        return { ...state, paymentSelector: payload, hostOrder: payload.hostOrder };
    default:
        return state;
    }
};

const actions = {
    toggleBookableUserDescriptionModal(visible = 'default') {
        if (visible !== 'default' && typeof visible === 'boolean') {
            return { type: types.TOGGLE_BOOKABLE_USER_MODAL_VISIBILITY, payload: { visible } };
        }
        return { type: types.TOGGLE_BOOKABLE_USER_MODAL_VISIBILITY };
    },
    showBookingSuccess(orderId) {
        return { type: types.SHOW_BOOKING_SUCCESS_MODAL, payload: { orderId } };
    },
    hideBookingSuccess() {
        return { type: types.HIDE_BOOKING_SUCCESS_MODAL };
    },
    showSignupSuccess: () => ({ type: types.SHOW_SIGNUP_SUCCESS_MODAL }),
    hideSignupSuccess: () => ({ type: types.HIDE_SIGNUP_SUCCESS_MODAL }),
    showMessageModal: (title, content) => ({
        type: types.SHOW_MESSAGE_MODAL,
        payload: {
            title,
            content
        }
    }),
    hideMessageModal() {
        return {
            type: types.HIDE_MESSAGE_MODAL
        };
    },
    showOrderAskUserMessage: payload => ({ type: types.SHOW_ORDER_USER_ASK_MESSAGE, payload }),
    hideOrderAskUserMessage: () => ({ type: types.HIDE_ORDER_USER_ASK_MESSAGE }),
    showForgotPasswordModal: () => ({ type: types.SHOW_FORGOT_PASSWORD_MODAL }),
    hideForgotPasswordModal: () => ({ type: types.HIDE_FORGOT_PASSWORD_MODAL }),
    showJoinCommunitiesModal: () => ({ type: types.SHOW_JOIN_COMMUNITIES_MODAL }),
    hideJoinCommunitiesModal: () => ({ type: types.HIDE_JOIN_COMMUNITIES_MODAL }),
    shouldShowMissingDetailsModal: payload => ({ type: types.SHOULD_SHOW_MISSING_DETAILS_MODAL, payload }),
    showPaymentSelector: payload => ({ type: types.SHOW_PAYMENT_SELECTOR, payload })
};

const getFns = {
    getBookableUserDescriptionVisibility(state) {
        return state.bookableModal;
    },
    getMessageModal(state) {
        return state.modal;
    },
    getBookingOrderId(state) {
        return state.bookingOrderId;
    },
    getIsBookingModalOpen(state) {
        return state.bookingModal;
    },
    getIsSignupSuccessOpen: state => state.signupModal,
    isOrderAskUserMessageOpen: state => state.orderAskUserMessage,
    showOrderChangeMessage: state => state.showOrderChangeMessage,
    showForgotPasswordModal: state => state.hostOrderModal,
    showJoinCommunitiesModal: state => state.joinCommunitiesModal,
    shouldShowMissingDetailsModal: state => state.missingDetailsModal,
    showPaymentSelector: state => state.paymentSelector
};

export default {
    reducer,
    actions,
    get: getFns
};
