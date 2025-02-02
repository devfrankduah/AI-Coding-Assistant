const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const dotenv = require('dotenv');

// Load environment variables from .env file
const env = dotenv.config().parsed || {};

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  devtool: 'source-map',
  entry: {
    popup: './src/popup/popup.ts',
    content: './src/content/content.ts',
    background: './src/background/serviceWorker.ts',
    solution: './src/popup/solution.ts'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        ],
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  optimization: {
    minimize: false,
    splitChunks: false
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(env)
    }),
    new HtmlWebpackPlugin({
      template: './src/popup/popup.html',
      filename: 'popup.html',
      chunks: ['popup']
    }),
    new HtmlWebpackPlugin({
      template: './src/popup/solution.html',
      filename: 'solution.html',
      chunks: ['solution']
    }),
    new CopyPlugin({
      patterns: [
        { 
          from: 'public',
          globOptions: {
            ignore: ['**/manifest.json']
          }
        },
        {
          from: 'public/manifest.json',
          transform(content) {
            return Buffer.from(JSON.stringify({
              ...JSON.parse(content.toString()),
              version: process.env.npm_package_version || '1.0.0'
            }, null, 2));
          }
        }
      ]
    })
  ]
}; 