const path = require('path');

module.exports = ({ sourceMap = false }) => ([
    {
        loader: 'css-loader',
        options: {
            importLoaders: 3
        }
    },
    { loader: 'postcss-loader' },
    { loader: 'resolve-url-loader' },
    {
        loader: 'sass-loader',
        options: {
            sourceMap,
            includePaths: [
                path.resolve(__dirname, 'node_modules/foundation-sites/scss')
            ]
        }
    }
]);
