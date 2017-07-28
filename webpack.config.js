const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	context: __dirname,
	entry: './src/Client.js',
	devtool: 'eval',
	output: {
		path: path.join(__dirname, '/dist'),
		filename: 'bundle.js',
		publicPath: '/dist/'
	},
	resolve: {
		extensions: ['.js', '.json']
	},
	stats: {
		colors: true,
		reasons: true,
		chunks: true
	},
	module: {
		rules: [
			{
				include: path.resolve(__dirname, 'src'),
				test: /\.js$/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	},
	plugins: [new HtmlWebpackPlugin()]
}