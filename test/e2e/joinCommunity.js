/* global describe it by element browser expect */

/**
 * Test User should not be a member of 'test text area' group Should
 * have a pending requestto the 'biking' group Should have joined the
 * 'test show member check12' group
 */

const login = require('../utils/e2e/login.js');
const { email, serverPath } = require('../utils/e2e/config.js');

function unjoinCommunity() {
    const https = require('https');
    const cmportalLogin = require('../utils/e2e/cmportalLogin.js');

    function unjoin(token) {
        // url to remove user from Hello Test Area group
        const url = 'dev.explorelifetraveling.com';
        const path = '/eltApp/api/v0.1/elt_groups/17/remove_member/';

        const postOptions = {
            host: url,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
                Authorization: `Token ${token}`
            }
        };

        const request = https.request(postOptions, () => {});

        const data = {
            member_username: email
        };
        request.write(JSON.stringify(data));
        request.end();
    }

    cmportalLogin(unjoin);
}

describe('test join community button', () => {
    const joinButton = by.css("[ng-click='joinGroup()']");
    const messageElem = by.css("[ng-model='showMsg.input']");

    function sendMessage(callback) {
        const submitButton = by.css('[ng-click=\'showSocialLink ? ' +
            'onOkClickFunction(showMsg.input,showMsg.linkedIn, showMsg.facebook) :' +
            'onOkClickFunction(showMsg.input); closePopUp()\']');
        const message = 'Message sent by test user.';

        element(messageElem).sendKeys(message);
        element(submitButton).click().then(callback);
    }

    it('should join community when join button is clicked', () => {
        browser.get(`http://${serverPath}/community/Hello%20test%20textarea`);

        login();

        element(joinButton).click();

        const callback = () => {
            const messageDisplayElem = by.binding('showMessageValue');
            const expectedMessage = 'Now you are member of group.';

            element(messageDisplayElem).getText().then(message => {
                expect(message).toEqual(expectedMessage);
                unjoinCommunity();
            });
        };

        sendMessage(callback);
    });

    it('should show request already exists if request made already', () => {
        const callback = () => {
            browser.isElementPresent(messageElem).then(() => {
                const messageDisplayElem = by.binding('showMessageValue');
                const expectedMessage = 'An existing request for the given ' +
                    'group already exists, for this User';

                element(messageDisplayElem).getText().then(message => {
                    expect(message).toEqual(expectedMessage);
                });
            });
        };

        browser.get(`http://${serverPath}/community/biking`);

        login();

        element(joinButton).click();

        sendMessage(callback);
    });

    it('should not show joinButton if already a member', () => {
        browser.get(`http://${serverPath}/community/test%20show%20member%20check12`);

        element(joinButton).isPresent().then(isPresent => {
            expect(isPresent).toEqual(false);
        });
    });
});
