const APP_ROOT = process.cwd();
const glob = require('glob');
const fs = require('fs');

/**
 * 指定examples 为markdown的文件夹
 * 并查找所有的md文件
 */
const foundMarkdown = glob.sync(`${APP_ROOT}/examples/*.md`, {});

/**
 * 获取文件内容并便利
 */
foundMarkdown.forEach(directory => {
	fs.readFile(directory, 'utf8', (e, d) => {
		if (e) {
			console.log(e);
		} else {
			const data = d;
			const newData = JSON.stringify(data);
			/**
       * 获取markdown的
       * css
       * html
       * js
       */
			const css = newData.match(/(```css.*?)[\s\n]*?(```)/)[0].replace(/```css/, '').replace(/```/, '').replace(/\\n/g, '');
			const html = newData.match(/(```html.*?)[\s\n]*?(```)/)[0].replace(/```html/, '').replace(/```/, '').replace(/\\n/g, '').replace(/\\/g, '');
			const js = newData.match(/(```js.*?)[\s\n]*?(```)/)[0].replace(/```js/, '').replace(/```/, '').replace(/\\n/g, '');
      
			dataInput({
				directory,
				type: 'css',
				value: css
			});
      
			dataInput({
				directory,
				type: 'js',
				value: js
			});
      
			dataInput({
				directory,
				type: 'html',
				value: html
			});
		}
	});
});

function dataInput(params) {
	const {
		directory,
		type,
		value
	} = params;
	const jsDirectory = directory.replace(/md/, type);
      
	fs.createWriteStream(jsDirectory);
      
	fs.writeFile(jsDirectory, value, (e) => {
		if (e) {
			console.log('写入失败');
		} else {
			console.log('写入成功');
		}
	});
};


const config = {
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.md&/,
				loader: 'atool-doc-md-loader'
			}
		]
	}
};