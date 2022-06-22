const path = require('path');
const fs = require('fs');
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;
const pagesDir = path.resolve(__dirname, 'src/pages');
const pages = fs.readdirSync(pagesDir);

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: 'all'
     },
  }

  if (isProd) {
    config.minimizer = [
      new CssMinimizerWebpackPlugin(),
      new TerserWebpackPlugin()
    ];
    config.minimize= true;
  }
  return config;
}

const getEntryPoints = () => {
  const entryPoints = {};
  pages.forEach((page) => {
    entryPoints[page] = `${pagesDir}/${page}/${page}.js`;
  });
  return entryPoints;
}


module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: 'development',
  entry: getEntryPoints(),
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js', '.png'],  // расширения файлов которые автоматом подключаются при импортах, т.е. не нужно писать "import './post.js'", достаточно "import './post'"
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@': path.resolve(__dirname, 'src')
    }
  },
  optimization: optimization(),
  devServer: {
    hot: isDev,
    compress: true,
    port: 8080,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  devtool: isDev ? 'source-map' : 'hidden-source-map',
  plugins: [
    ...pages.map(
      (page) =>
        new HTMLWebpackPlugin({
          filename: `${page}.html`,
          template: `${pagesDir}/${page}/${page}.pug`,
          chunks: [page],
        }),
    ),
    new CleanWebpackPlugin(),
    //new CopyWebpackPlugin(//{
      //patterns: [
        //{
        //  from: path.resolve(__dirname, 'src/favicon.ico'),
         // to: path.resolve(__dirname, 'dist')
       // }
      //]
   // }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),
    new ESLintPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {}
          },
          'css-loader',
          {
            loader: 'postcss-loader'
          },
          'resolve-url-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      },
      {
        test: /\.pug$/,
          loader: 'pug-loader',
          options: {
            pretty: isDev,
            root: path.resolve(__dirname, 'src')
          },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        include: path.resolve(__dirname, 'src'),
        generator: {
          filename: 'assets/images/[name].[contenthash].[ext]',
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|svg)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name].[contenthash].[ext]'
        }
      }
    ]
  }
}