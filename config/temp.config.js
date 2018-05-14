const fs = require('fs-extra');
const glob = require('glob');
const upath = require('upath');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const APP_ROOT = process.cwd();
let openPage = {};
let entry = {};
const { component } = require('./user.config.js') || {};


const getEntryFileContent = (entryPath, fullpath) => {
	let relativePath = path.relative(path.join(entryPath, '../'), fullpath);
	relativePath = upath.normalize(relativePath);
	let contents = '';
	contents += `\nimport React, { Component } from 'react';\n`;
	contents += `\nimport PropTypes from 'prop-types';\n`;
	contents += `\nimport { render } from 'react-dom';\n`;
	contents += `\nimport App from '${relativePath}';\n`;
	contents += `render(<App />, document.getElementById('pages'));\n`;
	return contents;
};
const getEntryFile = (dir) => {
	dir = dir || '.';
	const directory = path.join(APP_ROOT, 'src', dir);
  
	// 将返回一个包含“指定目录下所有文件名称”的数组对象
	fs.readdirSync(directory).forEach((file) => {
		// 文件地址
		const fullpath = path.join(directory, file);
		const paths = upath.normalize(fullpath).split('/') || [];
		// 获取文件信息
		const stat = fs.statSync(fullpath);
		// 获取文件后缀名
		const extname = path.extname(fullpath);
		if (stat.isFile() 
			&& (extname === '.jsx' || extname === '.js') 
			&& ( !component || fullpath.includes(component))
			&& paths.length >= 2 && paths[paths.length - 2] === 'examples'
		) {
			// 获取文件名字
			let name = path.join(dir, path.basename(file, extname));
			name = upath.normalize(name);
			// 用户测试单独文件
			const entryFile = path.join('temp', upath.normalize(dir).replace(/\/examples/, ''), file);
			fs.outputFileSync(path.join(entryFile), getEntryFileContent(entryFile, fullpath));
			// 文件路径
			entry[name.replace(/\/examples/, '')] = path.join(APP_ROOT, entryFile);
		} else if (stat.isDirectory() && file !== 'dist') {
			const subdir = path.join(dir, file);
			getEntryFile(subdir);
		}
	});
};
getEntryFile();

const getHtmlConfig = () => {
	let foundScripts;
	let suffix;

	if (glob.sync(`temp/*/*.jsx`, {}).length) {
		foundScripts = glob.sync(`temp/${component ? component : '*' }/*.jsx`, {});
		suffix = 'jsx';
	} else {
		foundScripts = glob.sync(`temp/${component ? component : '*' }/*.js`, {});
		suffix = 'js';
	}

	const arr = [];

	foundScripts.forEach(fullpath => {
		fullpath = upath.normalize(fullpath);
		let chunk = fullpath.replace(/temp\//, '').replace(/^(.*)\.(js|jsx)$/, '$1');
		let filename = path.join(APP_ROOT, fullpath.replace(/temp\//, 'dist/').replace(/\.(js|jsx)/, '.html'));
		openPage[chunk] = path.join(fullpath.replace(/temp\//, '/').replace(/\.(js|jsx)/, '.html'));
		arr.push(
			new HtmlWebpackPlugin({
				template: path.resolve(APP_ROOT, 'templates/tpl.html'),
				chunks: [chunk],
				inject: 'body',
				filename: filename
			})
		);
	});
	arr.push(
		new HtmlWebpackPlugin({
			inject: false,
			title: `${component ? component : 'All'} Demo`,
			publicPath: '',
			openPage,
			template: path.resolve(APP_ROOT, 'templates/index.ejs'),
		})
	);
	return arr;
};

module.exports = {
	entry,
	openPage,
	getHtmlConfig
};