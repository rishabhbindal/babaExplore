const path = require('path');
const webpack = require('webpack');
const argv = require('yargs').argv;

const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const hotEntry = [
    'webpack-dev-server/client?http://0.0.0.0:3000',
    'webpack/hot/dev-server',
    './js/react/reactOnlyPage.jsx'
];

const config = {
    resolve: {
        alias: {
            config: path.join(__dirname, 'config/development.js')
        }
    },
    devtool: 'eval',
    entry: {
        main: ['babel-polyfill', './js/index.js'],
        reactPage: ['./js/react/reactOnlyPage.jsx'],
        'app-migrate': './js/app-migration.es6.js'
    },
    output: {
        filename: '[name].js',
        path: 'public',
        publicPath: '/public/'
    },
    module: {
        rules: [
            { test: /\.html$/, loader: 'ng-cache-loader?module=templatescache&-url' },
            { test: /intlTelInputUtils\.js$/, loader: 'file-loader?name=[name]-[hash:10].[ext]' },
            {
                test: [/\.es6\.js$/, /\.spec\.js$/, /js\/react\//, /\.jsx/],
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    // https://babeljs.io/docs/plugins/
                    presets: [
                        ['env', {
                            targets: {
                                browsers: ['last 2 versions', 'safari >= 7']
                            },
                            modules: false,
                            useBuiltIns: true,
                            debug: true
                        }],
                        'react'
                    ],
                    plugins: [
                        'transform-class-properties',
                        'transform-object-rest-spread'
                    ]
                }
            },
            {
                test: /\.(ttf|woff|woff2)$/,
                loader: 'file-loader',
                options: {
                    name: '[path][name].[hash:6].[ext]'
                }
            },
            { test: /\.svg$/, loader: 'svg-sprite-loader' },
            {
                test: /\.(jpg|jpeg|gif|png)$/,
                loader: 'url-loader?limit=1024&name=[path][name].[hash:6].[ext]'
            }
        ],
        noParse: /[\/\\]node_modules[\/\\]angular[\/\\]angular\.js$/
    },
    plugins: [
        // https://github.com/webpack/webpack/issues/198
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new webpack.IgnorePlugin(/img\/.*\.png$/),
        new ExtractTextPlugin('[name].css'),
        new webpack.NormalModuleReplacementPlugin(/owl\.video\.play\.png$/, 'node-noop')
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
        __PAY_RAZOR_PAY_KEY__: JSON.stringify('rzp_test_lDLPc94665cXrV')
    };

    console.log('gateway=', gateway);
    if (gateway === 'production') {
        gatewayEnv = {
            __PAY_ZERO_GATEWAY__: JSON.stringify('PAYU'),
            __PAY_BACKEND_GATEWAY__: JSON.stringify('RAZOR_PAY'),
            __PAY_RAZOR_PAY_KEY__: JSON.stringify('rzp_live_s0tl4TqJp0niIm')
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
                    NODE_ENV: JSON.stringify('production')
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

// module.exports.getConfig = getConfig;
