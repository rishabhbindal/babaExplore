var spawn = require('child_process').spawn;
var karma = spawn('karma', ['start', 'karma.conf.js']);
var webpack = spawn('webpack', ['--watch']);

karma.stdout.on('data', ((data) => {
    console.log(data.toString('ascii'));
}));

karma.stderr.on('data', ((data) => {
    console.log('stderr: ', data.toString('ascii'));
}));

webpack.stdout.on('data', ((data) => {
    console.log(data.toString('ascii'));
}));

webpack.stderr.on('data', ((data) => {
    console.log('stderr: ', data.toString('ascii'));
}));
