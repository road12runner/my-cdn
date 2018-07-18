const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = () => ({
	mode: 'production',
	optimization: {
		minimizer: [
			new UglifyJSPlugin({
				cache: true,
				parallel: true,
				sourceMap: true // set to true if you want JS source maps
			}),
			new OptimizeCSSAssetsPlugin({})
		]
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {importLoaders: 1},
					},
					{
						loader: 'postcss-loader',
						options: {
							config: {
								path: __dirname + '../postcss.config.js'
							}
						},
					}
				]
			},
			{
				test: /\.tmpl$/,
				use: {
					loader: 'html-loader',
					options: {
						minimize: true
					}
				}
			}

		]
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'embed.min.css'
		})
	],
	devtool: 'source-map',
});