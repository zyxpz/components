const glob = require('glob');
const upath = require('upath');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const APP_ROOT = process.cwd();
let openPage = {};

const getHtmlConfig = () => {
  const foundScripts = glob.sync(`temp/*/*.js`, {});
  const arr = [];

  foundScripts.forEach(fullpath => {
    // fullpath = upath.normalize(fullpath);
    let chunk = fullpath.replace(/temp\//, '').replace(/^(.*)\.js$/, '$1');
    let filename = path.join(APP_ROOT, fullpath.replace(/temp\//, 'dist/').replace(/\.js/, '.html'));
    openPage[chunk] = path.join(fullpath.replace(/temp\//, '/').replace(/\.js/, '.html'));
    arr.push(
      new HtmlWebpackPlugin({
        template: path.resolve(APP_ROOT, 'templates/tpl.html'),
        chunks: [chunk],
        inject: 'body',
        filename: filename
      })
    );
    console.log(fullpath);
  });
}

getHtmlConfig();