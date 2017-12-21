const chalk = require('chalk');

module.exports = (env = 'test') => {
    const envList = ['test', 'live'];
    if (envList.indexOf(env) === -1) {
        console.log(
            chalk.red('Payment gateway environment should be one of ') +
                envList.map(e => chalk.blue(e)).join(',')
        );
        console.log(`Continuing with ${chalk.blue('test')} environment`);
    } else {
        console.log(`Payment gateway environment: ${chalk.blue(env)}`);
    }

    let gatewayEnv = {
        __PAY_ZERO_GATEWAY__: JSON.stringify('PAYU'),
        __PAY_BACKEND_GATEWAY__: JSON.stringify('PAYU'),
        __PAY_RAZOR_PAY_KEY__: JSON.stringify('rzp_test_lDLPc94665cXrV'),
        __PAY_PAYPAL_ENV__: JSON.stringify('sandbox'),
        __PAY_PAYPAL_KEY__: JSON.stringify('AZjpXIQaRnTJK8VajC0JD0Cx7oRABp1akiEiUlqzMtrJuB-qdgCf891ahz6t8zMUoFrbsVbLJ0qftJBv')
    };

    if (env === 'live') {
        gatewayEnv = {
            __PAY_ZERO_GATEWAY__: JSON.stringify('PAYU'),
            __PAY_BACKEND_GATEWAY__: JSON.stringify('RAZOR_PAY'),
            __PAY_RAZOR_PAY_KEY__: JSON.stringify('rzp_live_s0tl4TqJp0niIm'),
            __PAY_PAYPAL_ENV__: JSON.stringify('production'),
            __PAY_PAYPAL_KEY__: JSON.stringify('Aafp4PpnE25Gz0l169BZPt1_ChiCMO-4ULCxiF0Yilv44zcZspdXM5_5YRxG1VlJpSkKad2-jedsAHDq')
        };
    }

    return gatewayEnv;
};
