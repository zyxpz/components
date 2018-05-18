process.env.NODE_ENV = 'development';
const APP_ROOT = process.cwd();
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const upath = require('upath');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const R = require('ramda');
const MT = require('mark-twain');
const atoolDocUtil = require('atool-doc-util');
const ejs = require('ejs');
const {
	commonConfig
} = require('./webpack.common.config');
const pkg = require('../package.json');

/**
 * 指定examples 为markdown的文件夹
 * 并查找所有的md文件
 * 文件名是有顺序的
 */
const foundMarkdown = glob.sync(path.join(`${APP_ROOT}/examples`, '*.{js,jsx,html,md}'));

/**
 * 
 */
const isCode = R.compose(R.contains(R.__, ['js', 'jsx', 'javascript']), R.path(['props', 'lang']));
const isStyle = R.whereEq({
	type: 'code',
	props: {
		lang: 'css'
	}
});
const isHtml = R.whereEq({
	type: 'code',
	props: {
		lang: 'html'
	}
});
const getChildren = R.compose(R.prop('children'), R.defaultTo({}));


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

foundMarkdown.forEach(file => {
	file = upath.normalize(file);
	const ext = path.extname(file);
	const name = `examples/${path.basename(file, ext)}`;
	const pathWithoutExt = path.join(path.dirname(file), name);
	if (ext === '.md') {
		entry[name] = file;
	}
});
commonConfig.entry = entry;

commonConfig.output = {
	path: path.resolve(APP_ROOT, 'examples'),
	filename: '[name].js',
	libraryTarget: 'umd'
};
commonConfig.plugins = [];

foundMarkdown.forEach(e => {
	let filename, chunk;
	const file = returnFile({
		directory: e
	});
	
	const fileContentTree = MT(file).content;
	const meta = MT(file).meta;
	const code = getChildren(fileContentTree.find(isCode));
	const style = getChildren(fileContentTree.find(isStyle));
	const html = getChildren(fileContentTree.find(isHtml));
	
	/**
	 * 生成页面
	 */
	const rep = `${APP_ROOT}/`;
	e = e.replace(rep, '');
	chunk = e.replace(/examples\//, '').replace(/\.md/, '');
	filename = e.replace(/\.md/, '.html');

	commonConfig.plugins.push(
		new HtmlWebpackPlugin({
			template: `${APP_ROOT}/templates-md/element.ejs`,
			filename: filename,
			chunks: [],
			readme: atoolDocUtil.marked(fs.readFileSync(`${APP_ROOT}/${e}`, 'utf-8')),
			title: [chunk],
			scripts: '',
			data: {
				code,
				html,
				style
			}
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

function returnFile(params, cb) {

	const {
		directory
	} = params;
	/**
	 * 获取md内容
	 * 异步
	 */

	return fs.readFileSync(directory, { encoding: 'utf-8' });

	/**
	 * 同步
	 */
	// fs.readFile(directory, 'utf8', (err, d) => {
	// 	if (err) {
	// 		console.log(err);
	// 	} else {
	// 		const data = d;
	// 		/**
	// 		 * 获取markdown的
	// 		 * css
	// 		 * html
	// 		 * js
	// 		 */
	// 		const fileContentTree = MT(d).content;
	// 		const meta = MT(d).meta;
	// 		const code = getChildren(fileContentTree.find(isCode));
	// 		const style = getChildren(fileContentTree.find(isStyle));
	// 		const html = getChildren(fileContentTree.find(isHtml));

	// 		cb && cb({
	// 			code,
	// 			style,
	// 			html
	// 		});
	// 	}
	// });
}




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
// const fdMd = glob.sync(`${APP_ROOT}/examples/*.md`, {});

// fdMd.forEach(directory => {
// 	fs.readFile(directory, 'utf8', (e, d) => {
// 		if (e) {
// 			console.log(e);
// 		} else {
// 			const data = d;
// 			/**
//        * 获取markdown的
//        * css
//        * html
//        * js
//        */
// 			const fileContentTree = MT(d).content;

// 			console.log(fileContentTree);
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