export const types = {
    TOGGLE_LOGIN_MODAL_VISIBILITY: 'TOGGLE_LOGIN_MODAL_VISIBILITY'
};

const initialState = {
    visible: false,
    showSignup: false
};

const reducer = (state = initialState, { type, payload }) => {
    const { visible, showSignup } = payload || {};
    switch (type) {
    case types.TOGGLE_LOGIN_MODAL_VISIBILITY: {
        return { ...state, visible, showSignup };
    }
    default:
        return state;
    }
};

const actions = {
    toggleLoginModalVisibility(visible = false, showSignup = false) {
        if (visible !== 'default' && typeof visible === 'boolean') {
            return { type: types.TOGGLE_LOGIN_MODAL_VISIBILITY, payload: { visible, showSignup } };
        }
        return { type: types.TOGGLE_LOGIN_MODAL_VISIBILITY, payload: {} };
    }
};

export default { reducer, actions };
