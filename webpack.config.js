const NodemonPlugin = require('nodemon-webpack-plugin');
const path = require('path'); // Ding

module.exports = {
    entry: './publicApp/bundles/userPageRawBundle.js',
    output: {
        path: path.resolve('./public/js'),
        filename: 'bundle.js',
    },
    resolve: {
      alias: {
        vue: 'vue/dist/vue.min.js'
      }
    },
    plugins: [
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
        ext: 'js,njk,json',

        // Unlike the cli option, delay here is in milliseconds (also note that it's a string).
        // Here's 1 second delay:
        //delay: "1000",

        // Detailed log.
        verbose: true,
      })
    ],
};
