const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')

module.exports = (env, argv) => {
  return {
    entry: path.resolve(__dirname, '../src/script.js'),
    output:
    {
      filename: 'bundle.[contenthash].js',
      path: path.resolve(__dirname, '../dist'),
      publicPath: argv.mode === 'production' ? '/threejs-model-showroom/' : '/'
    },
    devtool: 'source-map',
    plugins:
      [
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, '../src/index.html'),
          minify: true,
          favicon: './assets/favicon/favicon.png',
          meta: {
            'og:url': { property: 'og:url', content: 'https://philszalay.github.io/3D-Model-Showroom/' },
            'og:description': { property: 'og:description', content: '3D Model Showcase implemented with Three.js' },
            'og:type': { property: 'og:type', content: 'website' },
            'og:title': { property: 'og:title', content: '3D Model Showcase' },
            'og:image': { property: 'og:image', content: 'https://philszalay.github.io/3D-Model-Showroom/assets/images/preview_image.png' },
            'twitter:card': { name: 'twitter:card', content: 'summary_large_image' },
            'twitter:title': { name: 'twitter:title', content: '3D Model Showcase' },
            'twitter:creator': { name: 'twitter:creator', content: '@PhilSzalay' },
            'twitter:image': { name: 'twitter:image', content: 'https://philszalay.github.io/3D-Model-Showroom/assets/images/preview_image.png' }
          }
        }),
        new MiniCSSExtractPlugin()
      ],
    module:
    {
      rules:
        [
          // HTML
          {
            test: /\.(html)$/,
            use: ['html-loader']
          },

          // JS
          {
            test: /\.js$/,
            exclude: /node_modules/,
            use:
              [
                'babel-loader'
              ]
          },

          // CSS
          {
            test: /\.css$/,
            use:
              [
                MiniCSSExtractPlugin.loader,
                'css-loader'
              ]
          },

          // Images
          {
            test: /\.(jpg|png|gif|svg|gltf|bin|ico)$/,
            use:
              [
                {
                  loader: 'file-loader',
                  options:
                  {
                    outputPath: 'assets/images/',
                    name: '[name].[ext]'
                  }
                }
              ]
          },

          // Fonts
          {
            test: /\.(ttf|eot|woff|woff2)$/,
            use:
              [
                {
                  loader: 'file-loader',
                  options:
                  {
                    outputPath: 'assets/fonts/'
                  }
                }
              ]
          }
        ]
    }
  }
}
