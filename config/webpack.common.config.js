console.log(`NODE_ENV:${process.env.NODE_ENV}`);

const path = require('path');
const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const myip = require('my-ip')();
/**
 * 用户定义
 */
let {
	port
} = require('./user.config') || {};
if (process.env.NODE_ENV === 'development') {
	port = port || 8989;
} else {
	port = 8001;
}
/**
 * 入口文件
 */

const {
	entry = {},
	getHtmlConfig
} = require('./temp.config');

const APP_ROOT = process.cwd();

const ENV_IS_DEV = process.env.NODE_ENV === 'development';

const postcssLoader = {
	loader: 'postcss-loader',
	options: {
		config: {
			path: path.resolve(APP_ROOT, 'config/postcss.config.js')
		}
	}
};

const config = {
	resolve: { // 重定向路径
		mainFiles: ['index.web', 'index'],
		modules: [path.resolve(APP_ROOT, 'src'), 'node_modules'],
		extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.ts', '.tsx', '.js', '.jsx', '.json', '.css', '.less', '.scss'],
		alias: {}
	},
	entry: Object.assign({}, entry),
	output: {
		path: path.resolve(APP_ROOT, 'dist'),
		filename: '[name].js',
		libraryTarget: 'umd'
	},
	module: {
		rules: [{
			test: /\.(js|jsx|ts|tsx)?$/,
			exclude: [
				/**
					 * 在node_modules的文件不被babel理会
					 */
				path.resolve(APP_ROOT, 'node_modules'),
			],
			use: [{
				loader: 'babel-loader',
				options: {
					cacheDirectory: true // 启用编译缓存
				}
			}]
		},
		{
			test: /\.(css|scss)$/,
			use: ['style-loader', 'css-loader', 'sass-loader', postcssLoader],
			include: [
				path.resolve(APP_ROOT, "node_modules"),
				path.resolve(APP_ROOT, "src/")
			]
		},
		{
			test: /\.less$/,
			use: [
				'style-loader',
				'css-loader',
				postcssLoader,
				{
					loader: "less-loader",
					options: {
						javascriptEnabled: true
					}
				}
			],
		},
		{
			test: /\.(png|jpg|gif|eot|ttf|woff|woff2|svg)$/,
			loader: 'url-loader',
			options: {
				limit: 10000
			}
		},
		{
			test: /\.html$/i,
			use: 'html-loader'
		}
		]
	},
	optimization: {
		// 默认关闭压缩
		minimize: ENV_IS_DEV ? false : JSON.parse(process.env.MINI_JS),
		// 原：NamedModulesPlugin()
		namedModules: true,
		// 原：NoEmitOnErrorsPlugin() - 异常继续执行
		noEmitOnErrors: true,
		// 原：ModuleConcatenationPlugin() - 模块串联 - dev模式下回影响antd（比如：Pagination, 和语言有关）
		concatenateModules: !ENV_IS_DEV
	},
	plugins: [
		...getHtmlConfig()
	]
};


const defaultConfig = {
	/**
	 * cheap-module-eval-source-map 原始源码（仅限行)
	 * none 生产环境 打包后的代码
	 */
	devtool: ENV_IS_DEV ? 'cheap-module-eval-source-map' : 'none',
	resolve: {
		/**
		 * 自动解析确定的扩展。
		 */
		extensions: ['.js', '.jsx', '.ts', '.tsx']
	},
	devServer: {
		host: myip,
		port: port || 8989,
		inline: true,
		stats: 'errors-only',
		historyApiFallback: true, // 当使用 HTML5 History API 时，任意的 404 响应都可能需要被替代为 index.html
		watchOptions: {
			aggregateTimeout: 300, // 重新构建前增加延迟
			poll: 1000, // 轮询
			ignored: /node_modules/ // 无视
		}
	},
	/**
	 * node
	 */
	node: {
		global: true,
		crypto: 'empty',
		__dirname: true,
		__filename: true,
		Buffer: true,
		clearImmediate: false,
		setImmediate: false
	},
	/**
	 * 启用编译缓存
	 */
	cache: true
};

module.exports = {
	commonConfig: webpackMerge(
		config,
		defaultConfig
	)
};