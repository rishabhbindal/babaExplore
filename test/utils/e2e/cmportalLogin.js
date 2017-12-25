const https = require('https');

const { email, password } = require('./config.js');

module.exports = function (callback) {
    const url = 'dev.explorelifetraveling.com';
    const path = '/eltApp/rest-auth/login/';

    let data = { username: email, password: password };
    data = JSON.stringify(data);

    let postOptions = {
        host: url,
        path: path,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
    };

    let request = https.request(postOptions, function (res) {
        res.on('data', (d) => {
            callback(JSON.parse(d).key);
        });
    });

    request.write(data);
    request.end();
};
