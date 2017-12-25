const path = require('path');
const webpack = require('webpack');
const argv = require('yargs').argv;

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const config = {
    resolve: {
        alias: {
            config: path.join(__dirname, '../config/development.js')
        }
    },
    devtool: 'eval',
    entry: {
        // main: ['babel-polyfill', './js/index.js'],
        reactPage: [
            'react-hot-loader/patch',
            'webpack-hot-middleware/client?reload=true',
            'babel-polyfill',
            './js/react/reactOnlyPage.jsx'
        ],
        // 'app-migrate': './js/app-migration.es6.js'
    },
    output: {
        filename: '[name].js',
        path: path.join(__dirname, '..', 'public'),
        publicPath: '/public/'
    },
    module: {
        rules: [
            {
                test: [/\.es6\.js$/, /\.spec\.js$/, /js\/react\/.*\.js$/, /\.jsx$/],
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.(ttf|woff|woff2|eot|svg)$/,
                loader: 'file-loader',
                options: {
                    name: 'fonts/[name].[hash:6].[ext]'
                }
            },
            {
                test: /\.(jpg|jpeg|gif|png)$/,
                loader: 'url-loader?limit=1024&name=[path][name].[hash:6].[ext]'
            },
            {
                test: /pannellum\.htm$/,
                use: [{
                    loader: 'file-loader',
                    query: {
                        name: '[name].[hash:7].[ext]'
                    }
                }]
            }
        ]
    },
    plugins: [
        // https://github.com/webpack/webpack/issues/198
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new webpack.IgnorePlugin(/img\/.*\.png$/),
        new ExtractTextPlugin('[name].css'),
        new webpack.HotModuleReplacementPlugin()
    ],
    stats: {
        assets: true,
        colors: true,
        modules: true,
        reasons: true
    }
};

/**
 * @param {resolve-url} helps with resolving url(...) requires in scss. ex,
 * webpack was having issues with url('owl.video.play.png') in
 * owl.carousel module.
 */
const getConfig = ({ isProduction, apiHost, analyze, gateway }) => {
    let scssLoader = [
        { loader: 'css-loader?importLoaders=1' },
        { loader: 'postcss-loader' },
        { loader: 'resolve-url-loader' },
        {
            loader: 'sass-loader',
            options: {
                sourceMap: true,
                includePaths: [
                    path.resolve(__dirname, 'node_modules/foundation-sites/scss')
                ]
            }
        }
    ];
    let cssLoader = [{ loader: 'css-loader' }];

    let gatewayEnv = {
        __PAY_ZERO_GATEWAY__: JSON.stringify('PAYU'),
        __PAY_BACKEND_GATEWAY__: JSON.stringify('PAYU'),
        __PAY_RAZOR_PAY_KEY__: JSON.stringify('rzp_test_lDLPc94665cXrV'),
        __PAY_PAYPAL_ENV__: JSON.stringify('sandbox'),
        __PAY_PAYPAL_KEY__: JSON.stringify('AZjpXIQaRnTJK8VajC0JD0Cx7oRABp1akiEiUlqzMtrJuB-qdgCf891ahz6t8zMUoFrbsVbLJ0qftJBv')
    };

    console.log('gateway=', gateway);
    if (gateway === 'production') {
        gatewayEnv = {
            __PAY_ZERO_GATEWAY__: JSON.stringify('PAYU'),
            __PAY_BACKEND_GATEWAY__: JSON.stringify('RAZOR_PAY'),
            __PAY_RAZOR_PAY_KEY__: JSON.stringify('rzp_live_s0tl4TqJp0niIm'),
            __PAY_PAYPAL_ENV__: JSON.stringify('production'),
            __PAY_PAYPAL_KEY__: JSON.stringify('Aafp4PpnE25Gz0l169BZPt1_ChiCMO-4ULCxiF0Yilv44zcZspdXM5_5YRxG1VlJpSkKad2-jedsAHDq')
        };
    }

    const hostUrl = apiHost === 'production' ? 'https://dev.explorelifetraveling.com' : 'https://www.explorelifetraveling.com';
    if (isProduction) {
        config.devtool = false;
        scssLoader = ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: scssLoader
        });
        cssLoader = ExtractTextPlugin.extract({
            use: cssLoader
        });
        config.plugins = config.plugins.concat([
            new webpack.DefinePlugin(Object.assign({
                'process.env': {
                    NODE_ENV: JSON.stringify('production'),
                    ELT_MAP_API_KEY: JSON.stringify('AIzaSyCyFU0kw0GTGbvlPyws9Se2RYdVdKgGBUA')
                },
                __DEVTOOLS__: false,
                __HOST_URL__: JSON.stringify(hostUrl)
            }, gatewayEnv)),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: true
                }
            })
        ]);
    } else {
        config.plugins = config.plugins.concat([
            new webpack.DefinePlugin(Object.assign({
                'process.env': {
                    ELT_MAP_API_KEY: JSON.stringify('AIzaSyCyFU0kw0GTGbvlPyws9Se2RYdVdKgGBUA')
                },
                __HOST_URL__: JSON.stringify(hostUrl)
            }, gatewayEnv))
        ]);
    }

    if (analyze) {
        config.plugins.push(new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerPort: 8880
        }));
    }

    return Object.assign({}, config, {
        module: Object.assign({}, config.module, {
            rules: config.module.rules.concat([{
                test: /\.scss$/,
                exclude: /node_modules/,
                use: [{ loader: 'style-loader' }].concat(scssLoader)
            }, {
                test: /\.css$/,
                use: [{ loader: 'style-loader' }].concat(cssLoader)
            }])
        })
    });
};

module.exports = getConfig(({ isProduction: false, analyze: argv.analyze, gateway: argv.gateway }));
