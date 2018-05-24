/**
 * 此为demo
 * 代码没有优化
 */
process.env.NODE_ENV = 'development';
const APP_ROOT = process.cwd();
const glob = require('glob');
const fs = require('fs');
const path = require('path');
const upath = require('upath');
const webpack = require('webpack');
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
const foundMarkdown = glob.sync(path.join(`${APP_ROOT}/examples`, '*.md'));

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
			loader: 'html-loader!markdown-loader',
			include: path.join(APP_ROOT, 'examples')
		}]
	},
};

/**
 * entry
 */
let entry = {};

foundMarkdown.forEach(file => {
	file = upath.normalize(file);
	const jsFile = returnFile({
		directory: file
	});
	const ext = path.extname(file);
	const name = `examples/${path.basename(file, ext)}`;
	const pathWithoutExt = path.join(path.dirname(file), name);
	const fileContentTree = MT(jsFile).content;
	const code = getChildren(fileContentTree.find(isCode)) || '';
	const jsPath = file.replace(/md/, 'js');

	// 创建文件
	fs.appendFile(jsPath, code, {
		encoding: 'utf-8'
	}, (e) => {
		if (e) {
			console.log(e);
		} else {
			console.log('ok');
		}
	});

	// 监控文件修改
	fs.watch(file,  (event, filename) => {
		if (filename) {
			 fs.unlink(jsPath);
			 const jsFile = returnFile({
				directory: file
			});
			const fileContentTree = MT(jsFile).content;
			const code = getChildren(fileContentTree.find(isCode));
			 fs.appendFile(jsPath, code, {
				encoding: 'utf-8'
			}, (e) => {
				if (e) {
					console.log(e);
				} else {
					console.log('ok');
				}
			});
		} else {
			console.log('filename not provided');
		}
	});

	if (ext === '.md' && jsPath.length) {
		entry[name] = jsPath;
	}

	// 监控进程关闭
	process.on('exit', (code) => {
		if (code === 0) {
			fs.unlink(jsPath);
		}
	});

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
	chunk = e.replace(/\.md/, '');
	filename = e.replace(/\.md/, '.html');

	commonConfig.plugins.push(
		new HtmlWebpackPlugin({
			template: `${APP_ROOT}/templates-md/element.ejs`,
			filename: filename,
			chunks: [chunk],
			readme: atoolDocUtil.marked(fs.readFileSync(`${APP_ROOT}/${e}`, 'utf-8')),
			title: [chunk],
			inject: 'body',
			scripts: '',
			data: {
				code,
				html,
				style
			}
		}),
		new webpack.optimize.SplitChunksPlugin({
			chunks: "all", // initial(初始块)、async(按需加载块)、all(全部块)，默认为all;
			minSize: 0, // 压缩前的最小模块大小，默认为0
			minChunks: 1, // 被引用次数，默认为1
			maxAsyncRequests: 5, // 最大的按需(异步)加载次数，默认为1
			maxInitialRequests: 3, //  最大的初始化加载次数，默认为1；
			name: 'commons' // 拆分出来块的名字(Chunk Names)，默认由块名和hash值自动生成；
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

	return fs.readFileSync(directory, {
		encoding: 'utf-8'
	});

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