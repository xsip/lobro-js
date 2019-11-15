const path = require('path');
const webpack = require('webpack');
module.exports = {
    mode: "production",
    devtool: "inline-source-map",
    entry: "./src/index.ts",
    watch: true,
    output: {
        filename: "bundle.js"
    },
    resolve: {
        modules: ['node_modules', 'src', path.resolve(__dirname, 'src/')],

        alias: {
            controller: path.resolve(__dirname, 'src/'),
            // '': path.resolve(__dirname, 'src/'),
        },
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js", ".scss", ".html"]
    },
    plugins: [],
    // new HtmlWebpackPlugin({template: './src/index.html'}), new webpack.optimize.ModuleConcatenationPlugin()
    module: {
        rules: [
            // all files with a `.ts` or `.tsx` extension will be handled by `ts-loader`
            {test: /\.tsx?$/, loader: "ts-loader"},
            {
                test: /\.s[ac]ss$/i,
                use: [
                    // Creates `style` nodes from JS strings
                    'style-loader',
                    // Translates CSS into CommonJS
                    'css-loader',
                    // Compiles Sass to CSS
                    'sass-loader',
                ],
            },
            {
                test: /\.html/i,
                use: 'raw-loader',
            },
        ]
    },
    devServer: {
        // Can be omitted unless you are using 'docker'
        host: '0.0.0.0',
        // This is where webpack-dev-server serves your bundle
        // which is created in memory.
        // To use the in-memory bundle,
        // your <script> 'src' should point to the bundle
        // prefixed with the 'publicPath', e.g.:
        //   <script src='http://localhost:9001/assets/bundle.js'>
        //   </script>
        // publicPath: '/assets/',
        // The local filesystem directory where static html files
        // should be placed.
        // Put your main static html page containing the <script> tag
        // here to enjoy 'live-reloading'
        // E.g., if 'contentBase' is '../views', you can
        // put 'index.html' in '../views/main/index.html', and
        // it will be available at the url:
        //   https://localhost:9001/main/index.html
        contentBase: path.resolve(__dirname, "dist/"),
        // 'Live-reloading' happens when you make changes to code
        // dependency pointed to by 'entry' parameter explained earlier.
        // To make live-reloading happen even when changes are made
        // to the static html pages in 'contentBase', add
        // 'watchContentBase'
        watchContentBase: true,
        compress: true,
        port: 9001
    },
};