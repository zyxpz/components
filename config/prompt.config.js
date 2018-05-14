const prompt = require('prompt');
const fs = require('fs-extra');

prompt.start();
prompt.get(['port', 'component'], (err, result) => {
	let { port, component } = result; // 用户输入值

	// 输出
	let contents = '';
	contents = `let obj = {port: '${port}', component: '${component}'}; module.exports = obj;`;

	fs.outputFileSync('./config/user.config.js', contents);

});