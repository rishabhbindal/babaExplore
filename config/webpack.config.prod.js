const path = require('path');
const webpack = require('webpack');
const fs = require('fs');

const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const getPaymentGatewayConfig = require('./paymentGatewayConfig.js');
const scssLoader = require('./scss.webpack-loader.js')({ sourceMap: false });
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

const webpackModuleConfig = {
    rules: [
        {
            test: [/\.es6\.js$/, /\.spec\.js$/, /js\/react\/.*\.js$/, /\.jsx/, /\.js/],
            exclude: /node_modules\/(?!webpack-require-weak.*)/,
            loader: 'babel-loader'
        },
        {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: scssLoader, allChunks: true })
        }, {
            test: /\.css$/,
            use: ExtractTextPlugin.extract({ use: [{ loader: 'css-loader' }], allChunks: true })
        },
        {
            test: /\.(ttf|woff|woff2|eot|svg)$/,
            loader: 'file-loader',
            options: {
                name: 'fonts/[name].[hash:6].[ext]'
            }
        },
        {
            test: /\.svg$/,
            use: [{
                loader: 'svg-sprite-loader',
                options: {
                    extract: true
                }
            }, {
                loader: 'svgo-loader'
            }]
        },
        {
            test: /\.(jpg|jpeg|gif|png)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: '1024',
                    name: '[path][name].[hash:6].[ext]'
                }
            }, {
                loader: 'image-webpack-loader',
                query: {
                    gifsicle: {
                        interlaced: true,
                        optimizationLevel: 7
                    },
                    progressive: true,
                    pngquant: {
                        quality: '65-90',
                        speed: 4
                    }
                }
            }]
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
};

const webpackResolveConfig = {
    alias: {
        config$: path.join(__dirname, '..', 'config/production.js')
    }
};

const gatewayConfig = getPaymentGatewayConfig('live');
const hostUrl = 'https://www.explorelifetraveling.com';

const webpackPlugins = ({ forNode } = {}) => [
    new SpriteLoaderPlugin(),
    //  https://github.com/webpack/webpack/issues/198
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    new ExtractTextPlugin('[name].[chunkhash:7].css'),
    new OptimizeCssAssetsPlugin({
        assetNameRegExp: /\.css$/g,
        cssProcessor: require('cssnano'),
        cssProcessorOptions: { discardComments: { removeAll: true } }
    }),
    new webpack.DefinePlugin(Object.assign({
        'process.env': {
            NODE_ENV: JSON.stringify('production'),
            ELT_IS_NOT_BROWSER: JSON.stringify(forNode ? 'true' : 'false'),
            ELT_HOST_URL: JSON.stringify(hostUrl),
            ELT_MAP_API_KEY: JSON.stringify('AIzaSyCyFU0kw0GTGbvlPyws9Se2RYdVdKgGBUA')
        },
        __DEVTOOLS__: false,
        __HOST_URL__: JSON.stringify(hostUrl)
    }, gatewayConfig)),
    new webpack.LoaderOptionsPlugin({
        minimize: true,
        debug: false
    }),
    new webpack.optimize.ModuleConcatenationPlugin()
];

const config = {
    resolve: webpackResolveConfig,
    entry: {
        reactPage: ['babel-polyfill', './js/react/reactOnlyPage.jsx']
    },
    output: {
        filename: '[name].[chunkhash:7].js',
        chunkFilename: '[name].[chunkhash:7].js',
        path: path.join(__dirname, '..', 'public'),
        publicPath: '/public/'
    },
    module: Object.assign({
        noParse: [/moment.js/]
    }, webpackModuleConfig),
    plugins: webpackPlugins({ forNode: false }),
    stats: {
        assets: true,
        colors: true,
        modules: true,
        reasons: true
    }
};

const serverConfig = {
    resolve: webpackResolveConfig,
    entry: {
        serverApp: ['babel-polyfill', './js/react/ServerApp.jsx']
    },
    output: {
        filename: '[name].js',
        libraryTarget: 'commonjs2',
        path: path.join(__dirname, '..', 'public'),
        publicPath: '/public/'
    },
    module: webpackModuleConfig,
    plugins: webpackPlugins({ forNode: true }),

    // Don't uncomment the next line. Avoids the issue with import
    // paths being wrong. With the line below commented, the code in
    // node_modules is also included in the bundles. Which allows for
    // https://github.com/thejameskyle/is-webpack-bundle to be
    // true. Which in turn makes react-loadable use the webpack weak
    // requires. Otherwise nodes requires would be used, which would
    // have path issues (nodejs requires work with path relative to
    // the execution path).

    // externals: /^[a-z\-0-9]+$/,
    target: 'node',
    stats: {
        assets: true,
        colors: true,
        modules: true,
        reasons: true
    }
};

const uglifyPlugin = new webpack.optimize.UglifyJsPlugin({
    beautify: false,
    mangle: {
        screw_ie8: true,
        keep_fnames: true
    },
    compress: {
        screw_ie8: true,
        warnings: false,
        drop_console: true
    },
    comments: false
});

const analyzePlugin = new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    reportFilename: 'report.html',
    openAnalyzer: true
});

const htmlPlugin = new HtmlWebpackPlugin({
    // Some scripts need to be include dynamically, based on the
    // path. So we take control of injecting scripts.
    inject: false,
    filename: 'react-out.hbs',
    template: '!!handlebars-loader!./react-tmpl.hbs',
    chunksSortMode: 'dependency'
});

const vendorCommonsPlugin = new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor', // Specify the common bundle's name.
    minChunks(module) {
        /**
         * Earlier, separate css modules where created for vendor and the
         * individual chunks. Somehow the import for the common scss
         * settings file, was breaking with this setup.
         *
         * The code below makes it so that all css goes to the main chunk.
         */
        if (module.resource && (/^.*\.(css|scss)$/).test(module.resource)) {
            return false;
        }

        return module.context && module.context.indexOf('node_modules') !== -1;
    }
});

    // CommonChunksPlugin will now extract all the common modules from
    // vendor and main bundles
const manifestCommonsPlugin = new webpack.optimize.CommonsChunkPlugin({
    // But since there are no more common modules between them we
    // end up with just the runtime code included in the manifest
    // file
    name: 'manifest',
    minChunks: Infinity
});

const statsPlugin = function statsPlugin() {
    this.plugin('done', (stats) => {
        fs.writeFileSync(
            path.join(__dirname, '../public', 'stats.generated.json'),
            JSON.stringify(stats.toJson())
        );
    });
};

const withPlugins = (conf, ps) =>
    Object.assign({}, conf, {
        plugins: conf.plugins.concat(ps)
    });

const getConfig = ({ analyze, server }) => {
    let clientConfig = withPlugins(config, [htmlPlugin, statsPlugin, uglifyPlugin, vendorCommonsPlugin, manifestCommonsPlugin]);

    if (analyze) {
        clientConfig = withPlugins(clientConfig, [analyzePlugin]);
    }

    if (server) {
        return serverConfig;
    }

    return clientConfig;
};

module.exports = env => getConfig(({ analyze: env && env.analyze, server: env && env.server }));
