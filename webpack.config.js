const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
module.exports = {
	entry: './src/index.js',
	output: {
		filename: 'embed.min.js',
		library: 'aam',
		libraryTarget:'umd'
	},

	module: {
		rules: [
			{
				test: /\.js$/,
				use: 'babel-loader'
			}
		]
	},
	plugins: [
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: 'src/assets/index.template.html',
		}),
		new CopyWebpackPlugin([
			'src/assets/app.js'
		]),
		new HtmlWebpackIncludeAssetsPlugin({
			assets: ['app.js'],
			append: true
		}),
		new webpack.ProvidePlugin(
			{
				$: 'jquery',
			}
		)
	],
	devtool: 'cheap-module-source-map'
};

/*
module: {
	loaders: [
		{
			loader: "babel-loader",

			// Skip any files outside of your project's `src` directory
			include: [
				path.resolve(__dirname, "src"),
			],

			// Only run `.js` and `.jsx` files through Babel
			test: /\.jsx?$/,

			// Options to configure babel with
			query: {
				plugins: ['transform-runtime'],
				presets: ['es2015', 'stage-0', 'react'],
			}
		},
	]
}
*/