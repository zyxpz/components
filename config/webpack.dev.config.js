const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const {
  commonConfig
} = require('./webpack.common.config');

const config = {
  mode: 'development',
}

module.exports = webpackMerge(
  commonConfig,
  config
)