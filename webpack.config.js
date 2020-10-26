const NodemonPlugin = require('nodemon-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin')

const path = require('path'); // Ding

module.exports = {
  entry: {
    userBundle: './publicApp/bundles/userPageRawBundle.js',
    lawyerBundle: './publicApp/bundles/lawyerPageRawBundle.js',
  },
  output: {
    path: path.resolve('./public/js'),
    filename: '[name].js',
  },
  mode: 'production',
  resolve: {
    alias: {
      vue: 'vue/dist/vue.min.js',
      //vue-route: 'kh'
    }
  },
  module: {
    rules: [
      // ... другие правила
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        loader: 'css-loader'
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new NodemonPlugin({
      // If using more than one entry, you can specify
      // which output file will be restarted.
      script: './start.js',

      // What to watch.
      watch: path.resolve('./'),

      // Arguments to pass to the script being watched.
      //args: ['demo'],

      // Node arguments.
      //nodeArgs: ['--debug=9222'],

      // Files to ignore.
      ignore: ['*.js.map'],

      // Extensions to watch.
      ext: 'js,njk,json,vue,ejs',

      // Unlike the cli option, delay here is in milliseconds (also note that it's a string).
      // Here's 1 second delay:
      //delay: "1000",

      // Detailed log.
      verbose: true,
    })
  ],
};
