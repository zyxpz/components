process.env.NODE_ENV = 'production'; // 开发环境

const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const { commonConfig } = require('./webpack.common.config');

const config = {
	mode: 'production',
};


module.exports = webpackMerge(
	commonConfig,
	config,
);