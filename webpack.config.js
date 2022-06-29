const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const MinifyPlugin = require("babel-minify-webpack-plugin");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const libraryName = process.env.npm_package_name;

const nodeEnv = process.env.NODE_ENV || 'development';
const isDev = (nodeEnv !== 'production');

const config = {
  mode: nodeEnv,
  context: path.resolve(__dirname, 'src'),
  entry: {
    dist: `/entries/${libraryName}.js`
  },
  devtool: isDev ? 'inline-source-map' : undefined,
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({})
    ]
  },
  output: {
    filename: `${libraryName}.js`,
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader'
        ],
      },
      {
        test: /\.svg|\.jpg|\.png$/,
        include: path.join(__dirname, 'src/images'),
        loader: 'file-loader',
        options: {
          name: 'images/[name].[ext]'
        }
      },
      {
        test: /\.woff$/,
        include: path.join(__dirname, 'src/fonts'),
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `${libraryName}.css`
    }),
    new MinifyPlugin({}, {
      sourceMap: isDev
    })
  ],
  stats: {
    colors: true
  }
};

module.exports = config;
