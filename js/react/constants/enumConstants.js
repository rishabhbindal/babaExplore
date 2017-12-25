
const createTypesWithPrefix = (prefix, ...types) =>
      types.map(t => t.toUpperCase()).reduce((rest, t) => ({
          ...rest,
          [t]: `${prefix.toUpperCase()}_${t}`
      }), {});
const createTypes = (...types) =>
      createTypesWithPrefix('', ...types);

export const chargeType = createTypes(
    'disabled',
    'percent',
    'amount'
);

export const couponState = createTypesWithPrefix(
    'coupon', 'invalid', 'used', 'expired', 'valid'
);

export const bookableTypes = createTypesWithPrefix(
    'bookable', 'package', 'video', 'room', 'tour'
);

export const signupForms = createTypesWithPrefix(
    'phone', 'verify', 'name', 'dob', 'password', 'about', 'picture'
);

/**
 * @see https://dev.explorelifetraveling.com/eltApp/api/v0.1/love/
 *
 * @member INITIAL_STATE     - Set when user first puts the listing in list
 * @member NOTIFICATION_SENT - When notification is sent to Manager and Host
 * @member ACCEPTED          - When property is ready to be booked
 * @member MANAGER_REJECTED  - When Manager rejects the request
 * @member HOST_REJECTED     - When Host rejects the request
 * @member USER_REJECTED     - When the user himself rejects the listing
 */
export const orderStates = createTypesWithPrefix(
    'order', 'initial_state', 'notification_sent',
    'accepted', 'manager_rejected', 'host_rejected', 'user_rejected',
    'payment_pending', 'payment_confirmed'
);