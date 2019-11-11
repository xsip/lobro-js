// const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    mode: "production",
    devtool: "inline-source-map",
    entry: "./src/index.ts",
    watch: true,
    output: {
        filename: "bundle.js"
    },
    resolve: {
        // Add `.ts` and `.tsx` as a resolvable extension.
        extensions: [".ts", ".tsx", ".js", ".scss", ".html"]
    },
    // plugins: [new HtmlWebpackPlugin({template: './src/index.html'})],
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
    }
};