var webpack = require('webpack');
var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	entry: [
		"./app/main.js"
	],
	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: "bundle.[hash].js"
	},
	module: {
		rules: [
			{ test: /\.css$/, loader: "style-loader!css-loader"}
		]
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify("production")
			}
		}),
		new HtmlWebpackPlugin({
			filename: 'index.html',
			template: './index.prod.html'
		})
	]
};