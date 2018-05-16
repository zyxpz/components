process.env.NODE_ENV = 'development';
const APP_ROOT = process.cwd();
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const upath = require('upath');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const atoolDocUtil = require('atool-doc-util');
const ejs = require('ejs');
const { commonConfig } = require('./webpack.common.config');
const pkg = require('../package.json');

/**
 * 指定examples 为markdown的文件夹
 * 并查找所有的md文件
 * 文件名是有顺序的
 */
const foundMarkdown = glob.sync(path.join(`${APP_ROOT}/examples`, '*.{js,jsx,html,md}'));

const config = {
	mode: 'development',
	module: {
		rules: [{
			test: /\.md$/,
			loader: 'markdown-ast-loader',
			include: path.join(APP_ROOT, 'examples')
		}]
	}
};

/**
 * entry
 */
let entry = {};
let filename, chunk;

foundMarkdown.forEach(file => {
	file = upath.normalize(file);
	const ext = path.extname(file);
	const name = path.basename(file, ext);
	const pathWithoutExt = path.join(path.dirname(file), name);
	if (ext === '.md') {
		entry[pathWithoutExt] = file;
	}
	
});

commonConfig.entry = entry;
commonConfig.output = {
	path: path.resolve(APP_ROOT, 'examples'),
	filename: '[name].js',
	libraryTarget: 'umd'
};
commonConfig.plugins = [];

const md = glob.sync(path.join(`examples`, '*.{js,jsx,html,md}'));

md.forEach(e => {
	chunk = e.replace(/examples\//, '').replace(/\.md/, '');
	filename = e.replace(/\.md/, '.html');
	console.log(e, [chunk], 1111111, filename);
	commonConfig.plugins.push(
		new HtmlWebpackPlugin({
			template: `${APP_ROOT}/templates-md/element.ejs`,
			filename: filename,
			chunks: [chunk],
			readme: atoolDocUtil.marked(fs.readFileSync(`${APP_ROOT}/${e}`, 'utf-8'))
		})
	);

});

/**
 * md EXAMPLES
 */
let link = {};
Object.keys(entry).forEach(key => {
	link[path.relative(APP_ROOT, key)] = key;
});

commonConfig.plugins.push(
	new HtmlWebpackPlugin({
		filename: 'index.html',
		template: `${APP_ROOT}/templates-md/index.ejs`,
		inject: 'body',
		chunks: [],
		title: `${pkg.name}@${pkg.version}`,
		link,
		readme: atoolDocUtil.marked(fs.readFileSync(path.join(APP_ROOT, 'README.md'), 'utf-8'))
	})
);

// ejs.render(fs.readFileSync(`${APP_ROOT}/templates-md/element.ejs`, 'utf-8'), {
// 	file: {
// 		title: 'test1111'
// 	}
// });


// console.log(webpackMerge(
// 	config,
// 	commonConfig
// ));

module.exports = webpackMerge(
	config,
	commonConfig
);

/**
 * 获取文件内容并便利
 */
// foundMarkdown.forEach(directory => {
// 	fs.readFile(directory, 'utf8', (e, d) => {
// 		if (e) {
// 			console.log(e);
// 		} else {
// 			const data = d;
// 			const newData = JSON.stringify(data);
// 			/**
//        * 获取markdown的
//        * css
//        * html
//        * js
//        */
// 			const css = newData.match(/(```css.*?)[\s\n]*?(```)/)[0].replace(/```css/, '').replace(/```/, '').replace(/\\n/g, '');
// 			const html = newData.match(/(```html.*?)[\s\n]*?(```)/)[0].replace(/```html/, '').replace(/```/, '').replace(/\\n/g, '').replace(/\\/g, '');
// 			const js = newData.match(/(```js.*?)[\s\n]*?(```)/)[0].replace(/```js/, '').replace(/```/, '').replace(/\\n/g, '');

// 			dataInput({
// 				directory,
// 				type: 'css',
// 				value: css
// 			});

// 			dataInput({
// 				directory,
// 				type: 'js',
// 				value: js
// 			});

// 			dataInput({
// 				directory,
// 				type: 'html',
// 				value: html
// 			});
// 		}
// 	});
// });

// function dataInput(params) {
// 	const {
// 		directory,
// 		type,
// 		value
// 	} = params;
// 	const jsDirectory = directory.replace(/md/, type);

// 	fs.createWriteStream(jsDirectory);

// 	fs.writeFile(jsDirectory, value, (e) => {
// 		if (e) {
// 			console.log('写入失败');
// 		} else {
// 			console.log('写入成功');
// 		}
// 	});
// };