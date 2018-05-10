const prompt = require('prompt');
const fs = require('fs-extra');

prompt.start();
prompt.get('port', (err, result) => {
  let { port } = result;

  // 输出
  let contents = '';
  contents = `let port = '${port}'; module.exports = port;`

  fs.outputFileSync('./config/user.config.js', contents)

})