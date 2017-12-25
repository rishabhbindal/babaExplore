const { email, password } = require('./config.js');

module.exports = function login() {
    var loginElemSelector = '[data-open="login-modal"]';
    element(by.css(loginElemSelector)).isPresent().then(function (isPresent) {
        if (isPresent) {
            element(by.css(loginElemSelector)).click();

            element(by.model('username')).sendKeys(email);
            element(by.model('password')).sendKeys(password);
            element(by.id('submit-login')).click();
            browser.waitForAngular();
        }
    });
};
