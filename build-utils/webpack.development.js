module.exports = () => ({
	mode: 'development',
	module: {
		rules: [
			{
				test: /\.scss$/,
				use: [
					'style-loader',
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
				use: 'html-loader'
			}
		]
	},
	devtool: 'cheap-module-source-map'
});