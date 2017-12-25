/* global angular describe it by element browser expect */

import downPayment from '../../js/services/calculateDownPayment.js';
import Listing from '../json/listing.json';

const bookableItems = Listing.bookable_items;

describe('test that downpayment is calculated correctly', () => {
    const requestedListingData = {
        bookables: {
            'https://dev.explorelifetraveling.com/eltApp/api/v0.1/bookable/292/': {
                requested: 1,
                packageType: 2,
                daily_price: 2,
                max_extra_guest: 0,
                extra_person_charge: 10,
                extra_person_requested: 1,
                downpayment_value_type: 'AMOUNT',
                downpayment_value: 100,
                explore_fee_type: 'PERCENT',
                calculated_explore_fee: 0.6,
                url: 'https://dev.explorelifetraveling.com/eltApp/api/v0.1/bookable/292/',
                extra_guests: 1
            }
        },
        date_from: '03/08/2016',
        date_until: '04/08/2016'
    };

    const copyWithIndexUpdate = (items, idx, obj) => {
        const newItems = items.slice();
        newItems[idx] = Object.assign({}, items[idx], obj);
        return newItems;
    };

    it('should show correct value when downPayment type is amount', () => {
        const downPaymentValue = downPayment(1, requestedListingData, bookableItems);

        expect(downPaymentValue).toEqual(100);
    });

    it('should show correct value when downPayment type is percentage', () => {
        const bookables = copyWithIndexUpdate(bookableItems, 2, {
            downpayment_value_type: 'PERCENT',
            downpayment_value: 50
        });

        const downPaymentValue =
              downPayment(1, requestedListingData, bookables);

        expect(downPaymentValue).toEqual(1);
    });

    it('should show total price when downPayment type is disabled', () => {
        const bookables = copyWithIndexUpdate(bookableItems, 2, {
            downpayment_value_type: 'DISABLED',
            downpayment_value: 50
        });

        const downPaymentValue =
              downPayment(1, requestedListingData, bookables);

        expect(downPaymentValue).toEqual(12);
    });

    it('should take extraperson charge in consideration when downPayment is disabled', () => {
        const bookables = copyWithIndexUpdate(bookableItems, 2, {
            guest_charge: 10,
            downpayment_value_type: 'DISABLED',
            downpayment_value: 50
        });

        const downPaymentValue =
              downPayment(1, requestedListingData, bookables);

        expect(downPaymentValue).toEqual(12);
    });
});
