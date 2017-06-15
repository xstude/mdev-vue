var VueMiddleware = require('mdev-vue-middleware');
var HtmlWebpackPlugin = require('html-webpack-plugin')
var Webpack = require('webpack');
var path = require('path');
var root = path.resolve(__dirname, '../').replace(/\\/g, '/');
var projectRoot = path.resolve(__dirname, '../../../').replace(/\\/g, '/');

module.exports = {
    entry: {
        ui: root + '/work/index.js',
        data: `${projectRoot}/src/data/app.js`
    },
    output: {
        publicPath: '${public-path}',
        path: projectRoot + '/dist',
        jsonpFunction: 'webpackJsonp_${namespace}',
        filename: #if($debug == true)'[name].js'#else'[name].[chunkhash].js'#end
    },
    module: {
        loaders: [
            {
                test: /\.css$/,
                loader: "style-loader!css-loader"
            },
            {
                test: /\.json$/,
                loader: "json-loader"
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            #if($babel == true)
            {
                test: /\.js$/,
                loader: 'babel',
                exclude: /node_modules/
            },
            #end
            {
                test: /\.html$/,
                loader: 'mdev-vue-middleware-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url',
                query: {
                    limit: 10000,
                    name: 'imgs/[name].[hash:7].[ext]'
                }
            },
            {
                test: /\.(woff2?|eot|ttf|otf|svg)(\?.*)?$/,
                loader: 'url-loader',
                query: {
                    limit: 10000,
                    name: 'fonts/[name].[hash:7].[ext]'
                }
            }
        ]
    },
    #if($babel == true)
    babel: {
        presets: ['es2015']
    },
    #end
    #if($debug == true)
    devtool: '#source-map',
    #end
    plugins: [
        new VueMiddleware({
            root: `${root}/work`,
            projectRoot: projectRoot,
        }),
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: projectRoot + '/src/data/app.html',
            inject: true
        })
        #if($debug != true)
        ,
        new Webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
        #end
    ]
};
