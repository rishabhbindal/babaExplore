/* global describe it by element browser expect */
const { serverPath } = require('../utils/e2e/config.js');

describe('E2E testing of signup flow: ', () => {
    function getUserData() {
        return {
            fname: {
                val: 'John',
                selector: by.id('first-name')
            },
            lname: {
                val: 'Doe',
                selector: by.id('last-name')
            },
            username: {
                val: 'ashwi@explore.com',
                selector: by.id('email')
            },
            about: {
                val: `What is this life if, full of care, We have no time to stand and
                 stare. No time to stand beneath the boughs And stare
                 as long as sheep or cows. No time to see, when woods
                 we pass, Where squirrels hide their nuts in grass.
                 No time to see, in broad daylight, Streams full of
                 stars, like skies at night. No time to turn at
                 Beauty's glance, And watch her feet, how they can
                 dance. No time to wait till her mouth can Enrich that
                 smile her eyes began. A poor life this if, full of
                 care, We have no time to stand and stare.`,
                selector: by.model('data.about')
            },
            dob_dd: {
                val: '13',
                selector: by.model('data.dob_dd')
            },
            dob_mm: {
                val: '05',
                selector: by.model('data.dob_mm')
            },
            dob_yyyy: {
                val: '1998',
                selector: by.model('data.dob_yyyy')
            },
            city: {
                val: 'Bengaluru',
                selector: by.model('data.city')
            },
            password: {
                val: 'complicated_password',
                selector: by.id('password')
            },
            conpassword: {
                val: 'complicated_password',
                selector: by.id('cpassword')
            },
            gender: {
                click: true,
                selector: by.css('[for="male"]')
            },
            terms: {
                click: true,
                selector: by.id('terms')
            }
        };
    }

    const setElemValue = (selector, value, click) => {
        const elem = element(selector);

        if (click) {
            elem.click();
            return;
        }

        element(selector).sendKeys(String(value));
    };

    const setAllUserData = userData => {
        function setPhoneNumber() {
            browser.executeScript('$("#phone_number").intlTelInput("setNumber", "+91987654321");');
        }

        setPhoneNumber();
        for (let elem in userData) {
            if (userData.hasOwnProperty(elem)) {
                elem = userData[elem];
                setElemValue(elem.selector, elem.val, elem.click);
            }
        }
    };

    it('should successfully create an account on valid data', done => {
        const userData = getUserData();

        const signupPath = `http://${serverPath}/signup`;

        browser.get(signupPath);
        browser.waitForAngular();

        const logoutBtn = by.css('[ng-click="logout();"]');

        const createAccount = () => {
            browser.get(signupPath);
            browser.waitForAngular();

            setAllUserData(userData);

            element(by.css('[ng-click="signup()"]')).click().then(() => {
                const messageDisplayElem = by.css('[ng-bind-html="showMessageValue"]');

                const expectedMessage = 'Please check your email for the email address' +
                ' confirmation from ExploreLifeTraveling. Please also check your spam ' +
                'folder or promotion tab in case you don\'t see ExploreLifeTraveling ' +
                'email in your inbox';

                browser.isElementPresent(messageDisplayElem).then(() => {
                    setTimeout(() => {
                        element(messageDisplayElem).getText().then(message => {
                            done(expect(message).toEqual(expectedMessage));
                        });
                    }, 500);
                });
            });
        };

        element(logoutBtn).isPresent().then(loggedIn => {
            if (loggedIn) {
                element(logoutBtn).click().then(() => {
                    createAccount();
                });
                return;
            }

            createAccount();
        });
    });
});
