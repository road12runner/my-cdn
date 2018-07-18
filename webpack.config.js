//const webpack = require('webpack');
const webpackMerge = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackIncludeAssetsPlugin = require('html-webpack-include-assets-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// load config for dev or production
const modeConfig = env => require(`./build-utils/webpack.${env}`)(env);

// load skin config
//const presetConfig = require('./build-utils/loadPresets');
const path = require('path');

module.exports = ({mode, skin}) => {
	console.log(mode, skin);

	return webpackMerge({

			entry: ['babel-polyfill', `./src/skins/${skin}/index.js`],
			output: {
				filename: 'embed.min.js',
				library: 'aam',
				libraryTarget: 'umd',
				path: path.resolve(__dirname, `dist/${skin}`)
			},

			plugins: [
				new HtmlWebpackPlugin({
					filename: 'index.html',
					template: `src/skins/${skin}/assets/index.template.html`,
				}),
				new CopyWebpackPlugin([
					`src/skins/${skin}/assets/app.js`
				]),
				new HtmlWebpackIncludeAssetsPlugin({
					assets: ['app.js'],
					append: true
				})
			],


			module: {
				rules: [
					{
						test: /\.js$/,
						exclude: /node_modules/,
						use: 'babel-loader'
					},
				]
			}

		},
		modeConfig(mode)
		//, presetConfig({mode, presets})
	);

	// entry: './src/index.js',
	// plugins: [
	// 	new HtmlWebpackPlugin({
	// 		filename: 'index.html',
	// 		template: 'src/assets/index.template.html',
	// 	}),
	// 	new CopyWebpackPlugin([
	// 		'src/assets/app.js'
	// 	]),
	// 	new HtmlWebpackIncludeAssetsPlugin({
	// 		assets: ['app.js'],
	// 		append: true
	// 	})
	// 	// ,
	// 	// new webpack.ProvidePlugin(
	// 	// 	{
	// 	// 		$: 'jquery',
	// 	// 	}
	// 	// )
	// ],
	// devtool: 'cheap-module-source-map'
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