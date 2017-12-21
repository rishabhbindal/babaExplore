/* global describe beforeEach module inject it by element browser expect */

describe('signup flow', () => {
    beforeEach(module('explore'));

    let $controller;
    let $scope;
    let $window;

    beforeEach(inject((_$controller_, _$rootScope_, _$window_) => {
        $controller = _$controller_;
        $scope = _$rootScope_;
        $window = _$window_;
    }));

    function initialiseIt() {
        function initialiseScope() {
            const data = $scope.data;
            data.firstname = 'John';
            data.lastname = 'Doe';

            data.date_of_birth = '13-05-1998';
            data.dob_dd = '13';
            data.dob_mm = '05';
            data.dob_yyyy = '1998';

            data.gender = 'MALE';
            data.username = 'john@explore.com';
            data.terms = true;
            data.password = 'complicated_password';
            data.conpassword = 'complicated_password';
            data.city = 'Bengaluru';

            data.details = {};
            data.details.phone_number = '+910987654321';

            $scope.data.about = 'What is this life if, full of care,' +
                ' We have no time to stand and stare.' +
                ' No time to stand beneath the boughs' +
                'And stare as long as sheep or cows.' +
                ' No time to see, when woods we pass,' +
                'Where squirrels hide their nuts in grass.' +
                'No time to see, in broad daylight,' +
                'Streams full of stars, like skies at night.' +
                'No time to turn at Beauty\'s glance,' +
                'And watch her feet, how they can dance.' +
                'No time to wait till her mouth can' +
                'Enrich that smile her eyes began.' +
                'A poor life this if, full of care,' +
                'We have no time to stand and stare.';
        }

        $controller('SignupController', { $scope });
        initialiseScope();
    }

    beforeEach(initialiseIt);

    function propMissingTest(propName, errorMessage, propInDetails) {
        const message = errorMessage || `Please fill ${propName}.`;

        it(`should give error if ${propName} is missing`, () => {
            const scope = propInDetails ? $scope.data.details : $scope.data;

            scope[propName] = undefined;

            $scope.data.isValid();

            const index = $scope.data.errors.indexOf(message);

            expect(index).not.toEqual(-1);
        });
    }

    mockGlobals();

    it('should not show error on passing correct data', () => {
        $scope.data.isValid();

        expect($scope.data.errors.length).toEqual(0);
    });

    it('$scope.data.errors should be non empty for invalid data', () => {
        $scope.data.details = {};

        $scope.data.isValid();

        expect($scope.data.errors.length).not.toEqual(0);
    });

    describe('give correct errors for missing data: ', () => {
        const props = [
            { name: 'firstname', errorMessage: 'Please fill first name.' },
            { name: 'lastname', errorMessage: 'Please fill last name.' },
            { name: 'about', errorMessage: 'Please fill about yourself.' },
            { name: 'city', errorMessage: 'Please fill city.' },
            { name: 'username', errorMessage: 'Please fill email.' },
            { name: 'phone_number', errorMessage: 'Please fill phone number.',
                propInDetails: true },
            { name: 'terms', errorMessage: 'Please accept Terms and Conditions.' },
            { name: 'gender', errorMessage: 'Please select gender.' }
        ];

        props.forEach(p => propMissingTest(p.name, p.errorMessage, p.propInDetails));
    });

    describe('date_of_birth tests: ', () => {
        const tests = [{
            propName: 'dob_dd',
            errorMessage: 'Invalid Day in Date of Birth'
        }, {
            propName: 'dob_mm',
            errorMessage: 'Invalid Month in Date of Birth'
        }, {
            propName: 'dob_yyyy',
            errorMessage: 'Invalid Year in Date of Birth, enter in yyyy format.'
        }];

        tests.forEach(test => {
            propMissingTest(test.propName, test.errorMessage);
        });

        it('should give correct error if no date is provided', () => {
            $scope.data.dob_dd = $scope.data.dob_mm = $scope.data.dob_yyyy = undefined;
            $scope.data.isValid();

            const error = 'Please fill Date of Birth';
            const index = $scope.data.errors.indexOf(error);

            expect(index).not.toEqual(-1);
        });

        it('should not accept invalid dates', () => {
            it('should not accept 29 Feb for non leap years', () => {
                const data = $scope.data;
                data.dob_dd = '29';
                data.dob_mm = '2';
                data.dob_yyyy = '1991';

                const error = 'Wrong combination of Date and Month in Date of Birth.';
                data.isValid();

                const index = data.errors.indexOf(error);
                expect(index).not.toEqual(-1);
            });

            it('should not accept if age more than 90', () => {
                const data = $scope.data;
                data.dob_dd = '29';
                data.dob_mm = '2';
                data.dob_yyyy = '1900';

                const error = 'You must be at most 90 years of age.';
                const index = data.errors.indexOf(error);

                expect(index).not.toEqual(-1);
            });

            it('should not accept if age less than 18', () => {
                const data = $scope.data;
                data.dob_dd = '29';
                data.dob_mm = '2';
                data.dob_yyyy = '2000';

                const error = 'You must be at least 18 years of age.';
                const index = data.errors.indexOf(error);

                expect(index).not.toEqual(-1);
            });
        });
    });

    describe('tests for validating text fields: ', () => {
        it('should give error on invalid firstname', () => {
            $scope.data.firstname = 'John4';

            $scope.data.isValid();

            const error = 'First Name can contain only characters';
            const index = $scope.data.errors.indexOf(error);

            expect(index).not.toEqual(-1);
        });

        it('should give error on invalid lastname', () => {
            $scope.data.lastname = 'Doe4';

            $scope.data.isValid();

            const error = 'Last Name can contain only characters';
            const index = $scope.data.errors.indexOf(error);

            expect(index).not.toEqual(-1);
        });

        it('should give error on invalid about', () => {
            $scope.data.about = 'less than 80 characters long';

            $scope.data.isValid();

            const error = 'Help other people get to know you better, ' +
                'please write at least 80 characters about yourself';
            const index = $scope.data.errors.indexOf(error);

            expect(index).not.toEqual(-1);
        });
    });
});
