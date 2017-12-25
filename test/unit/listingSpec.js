/* global describe beforeEach module inject it by element browser expect */

const LISTING = readJSON('test/json/listing.json');

describe('check availability', () => {
    beforeEach(module('explore'));

    let $controller;
    let $scope;
    let $window;

    beforeEach(inject((_$controller_, _$rootScope_, _$window_) => {
        $controller = _$controller_;
        $scope = _$rootScope_;
        $window = _$window_;
    }));

    mockGlobals();

    const initialisePayMentDetail = () => {
        $scope.paymentDetail = {
            checking: 0,
            code: '',
            days: 0,
            discount: 0,
            discountPer: 0,
            oneDayPrice: 0,
            tax: 0,
            taxPer: '2.1',
            totalPrice: 0
        };
    };

    const initialiseLoveData = () => {
        $scope.loveData = [];
    };

    const defaults = {
        url: '',
        requested: 0,
        packageType: 1,
        daily_price: 5000,
        max: 4,
        extra_person_requested: 0,
        extra_person_charge: 500,
        explore_fee_type: 'DISABLED',
        explore_fee: 100,
        downpayment_value_type: 'DISABLED',
        downpayment_value: 100
    };

    const bookableWithURL = url => Object.assign({}, defaults, { url });

    const intialiseRequestedListingData = () => {
        $scope.requestedListingData = {
            bookables: {
                'https://dev.explorelifetraveling.com/eltApp/api/v0.1/bookable/222/':
                bookableWithURL('https://dev.explorelifetraveling.com/eltApp/api/v0.1/bookable/222/'),
                'https://dev.explorelifetraveling.com/eltApp/api/v0.1/bookable/292/':
                bookableWithURL('https://dev.explorelifetraveling.com/eltApp/api/v0.1/bookable/292/')
            },
            date_from: '24/06/2016',
            date_until: '25/06/2016'
        };
    };

    const initialiseScope = () => {
        intialiseRequestedListingData();
        initialiseLoveData();
        initialisePayMentDetail();

        $scope.packeageType = 1;
        $controller('ListingController', { $scope });

        $scope.listing = LISTING;
    };

    beforeEach(initialiseScope);

    describe('test showTotalPrice', () => {
        const requestBookable = (bookableId, values) => {
            const url = `https://dev.explorelifetraveling.com/eltApp/api/v0.1/bookable/${bookableId}/`;
            const bookable = $scope.requestedListingData.bookables[url];

            bookable.requested = 1;

            $scope.requestedListingData.date_from = '24/06/2016';
            $scope.requestedListingData.date_until = '25/06/2016';

            if (values) {
                for (const prop in values) {
                    if (values.hasOwnProperty(prop)) {
                        bookable[prop] = values[prop];
                    }
                }
            }
        };

        it('should show 0 price for no bookable requested', () => {
            $scope.showTotalPrice();

            expect($scope.paymentDetail.totalPrice).toEqual(0);
        });

        it('should show some price on bookable request', () => {
            requestBookable(222);
            $scope.showTotalPrice();

            expect($scope.paymentDetail.totalPrice).not.toEqual(0);
        });

        it('should show correct total for booking', () => {
            requestBookable(222);
            $scope.showTotalPrice();

            expect($scope.paymentDetail.totalPrice).toEqual(5100);
        });

        it('should give correct total for extraperson', () => {
            requestBookable(292, {
                extra_guests: 2
            });

            $scope.showTotalPrice();

            expect($scope.paymentDetail.totalPrice).toEqual(6324);
        });

        it('should show correct price for multiple bookables', () => {
            requestBookable(222);
            requestBookable(292, {
                extra_guests: 2
            });

            $scope.showTotalPrice();

            expect($scope.paymentDetail.totalPrice).toEqual(11424);
        });

        it('should show correct explore fee', () => {
            requestBookable(292, {
                explore_fee_type: 'AMOUNT',
                explore_fee: 100
            });

            $scope.showTotalPrice();

            expect($scope.paymentDetail.exploreFee).toEqual(200);
        });
    });
});
