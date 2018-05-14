process.env.NODE_ENV = 'development'; // 开发环境
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpackMerge = require('webpack-merge');

const { commonConfig } = require('./webpack.common.config');

const APP_ROOT = process.cwd();

console.log(APP_ROOT);

commonConfig.entry = `${APP_ROOT}/test/test.js`;
commonConfig.plugins = [];
commonConfig.plugins.push(
	new HtmlWebpackPlugin({
		template: `${APP_ROOT}/test/test.html`
	})
);

const config = {
	mode: 'development'
};

module.exports = webpackMerge(
	config,
	commonConfig
);