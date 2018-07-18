const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');

console.log('dirname',__dirname);

module.exports = () => ({

	entry: ['babel-polyfill', './src/skins/iResponsive/index.js'],
	output: {
		filename: 'embed.min.js',
		library: 'aam',
		libraryTarget:'umd',
		path: path.resolve(__dirname, '../../dist/iResponsive')
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'src/skins/iResponsive/assets/index.template.html',
		}),
		new CopyWebpackPlugin([
			'src/skins/iResponsive/assets/app.js'
		]),
		new HtmlWebpackIncludeAssetsPlugin({
			assets: ['app.js'],
			append: true
		})
	]

});