var path = require('path');

module.exports = {
	devtool: "eval",
	entry: [
		'webpack/hot/only-dev-server', // "only" prevents reload on syntax errors
		"./app/main.js"
	],
	output: {
		path: path.resolve(__dirname, 'js'),
		filename: "bundle.js"
	},
	module: {
		rules: [
			{ test: /\.css$/, loader: "style-loader!css-loader"},
			{ test: /\.js$/,  exclude: /node_modules/, loaders: ["react-hot-loader"] }
		]
	}
};